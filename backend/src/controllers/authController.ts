import { Request, Response } from "express";
import User from "../models/User";
import { generateToken } from "../utils/generateToken";

// POST /api/auth/register
export const register = async (req: Request, res: Response) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: "An account with this email already exists" });
  }

  // Password hashing happens automatically in the User model's
  // pre-save hook -- we never touch or store the plain-text password.
  const user = await User.create({ name, email, password });

  const token = generateToken(String(user._id), user.role);

  res.status(201).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

// POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.comparePassword(password))) {
    // Deliberately vague: don't reveal whether the email exists.
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = generateToken(String(user._id), user.role);

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

// GET /api/auth/me  (requires auth)
export const getMe = async (req: Request, res: Response) => {
  const user = req.user!;
  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
};
