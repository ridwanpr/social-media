import * as z from "zod";
import * as jose from "jose";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";

const registerUser = async (req, res) => {
  try {
    const userSchema = z.object({
      fullname: z
        .string("fullname is required")
        .min(3, "fullname need at least 3 characters"),
      username: z
        .string("username is required")
        .min(5, "username need at least 5 characters"),
      email: z.email("Email format invalid"),
      password: z
        .string("password is required")
        .min(8, "password neet at least 8 characters"),
    });

    const validated = userSchema.parse(req.body);

    const isEmailUsed = await prisma.user.findUnique({
      where: {
        email: validated.email,
      },
    });

    if (isEmailUsed) {
      return res.status(400).json({
        message:
          "Email already used by other account, please choose other email.",
      });
    }

    const isUsernameUsed = await prisma.user.findUnique({
      where: {
        username: validated.username,
      },
    });

    if (isUsernameUsed) {
      return res.status(400).json({
        message: "Username not available, please choose other username.",
      });
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10);

    const newUser = await prisma.user.create({
      data: {
        fullname: validated.fullname,
        username: validated.username,
        email: validated.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        fullname: true,
        username: true,
        email: true,
        image: true,
        bio: true,
      },
    });

    return res.status(201).json({
      message: "Register user success",
      data: newUser,
    });
  } catch (err) {
    console.log(err);
    if (err instanceof z.ZodError) {
      const errors = z.flattenError(err);

      return res.status(400).json({
        message: "Register user failed",
        errors: errors.fieldErrors,
      });
    }

    return res.status(500).json({ message: "Unexpected errors" });
  }
};

const loginUser = async (req, res) => {
  try {
    const loginSchema = z.object({
      email: z.email(),
      password: z.string().min(8),
    });

    const validated = loginSchema.parse(req.body);

    const findUser = await prisma.user.findUnique({
      where: {
        email: validated.email,
      },
    });

    if (!findUser) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const checkPassword = await bcrypt.compare(
      validated.password,
      findUser.password,
    );

    if (!checkPassword) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const alg = "HS256";
    const jwt = await new jose.SignJWT({ id: findUser.id })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime("1d")
      .sign(secret);

    return res.status(200).json({
      message: "Login Success",
      data: {
        id: findUser.id,
        email: findUser.email,
        username: findUser.username,
        name: findUser.name,
        image: findUser.image,
        bio: findUser.bio,
      },
      token: jwt,
    });
  } catch (err) {
    console.log(err);
    if (err instanceof z.ZodError) {
      const errors = z.flattenError(err);

      return res.status(400).json({
        message: "Login user failed",
        errors: errors.fieldErrors,
      });
    }

    return res.status(500).json({ message: "Unexpected errors" });
  }
};

export { registerUser, loginUser };
