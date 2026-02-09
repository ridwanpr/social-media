import * as z from "zod";
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
    if (err instanceof z.ZodError) {
      const errors = z.flattenError(err);

      return res.status(400).json({
        message: "Register user failed",
        errors: errors.fieldErrors,
      });
    }

    console.log(err);
    return res.status(500).json({ messaeg: "Unexpected errors" });
  }
};

const loginUser = (req, res) => {
  return res.sendStatus(200);
};

export { registerUser, loginUser };
