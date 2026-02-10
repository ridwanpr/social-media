import * as z from "zod";
import * as jose from "jose";
import { prisma } from "../lib/prisma.js";

export const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
      omit: {
        password: true,
        imageId: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json({ message: "Fetch user detail success", data: user });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Unexpected errors",
    });
  }
};

export const searchUser = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({
        message: "Search query is missing",
      });
    }

    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: username,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        fullname: true,
        username: true,
        image: true,
      },
    });

    return res.json({
      message: "Search user success",
      data: users,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Unexpected errors",
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userSchema = z.object({
      fullname: z
        .string("fullname is required")
        .min(3, "fullname need at least 3 characters"),
      username: z
        .string("username is required")
        .min(5, "username need at least 5 characters"),
    });

    const validated = userSchema.parse(req.body);

    const currentUserId = req.user.id;

    const existingUser = await prisma.user.findUnique({
      where: {
        username: validated.username,
      },
    });

    if (existingUser && existingUser.id !== currentUserId) {
      return res.status(400).json({
        message: "username already used, please choose another username",
      });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: currentUserId,
      },
      data: {
        fullname: validated.fullname,
        username: validated.username,
        bio: req.body.bio,
      },
      omit: {
        password: true,
        imageId: true,
      },
    });

    return res.json({
      message: "Update user success",
      data: updatedUser,
    });
  } catch (err) {
    console.log(err);
    if (err instanceof z.ZodError) {
      const errors = z.flattenError(err);

      return res.status(400).json({
        message: "Update user failed",
        errors: errors.fieldErrors,
      });
    }

    return res.status(500).json({ message: "Unexpected errors" });
  }
};
