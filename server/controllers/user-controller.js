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
