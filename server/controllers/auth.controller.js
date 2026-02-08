const registerUser = (req, res) => {
  const { username, password, fullname, email } = req.body || {};

  return res.json({
    message: "Register user success",
    data: {
      username,
      password,
      fullname,
      email,
    },
  });
};

const loginUser = (req, res) => {
  return res.sendStatus(200);
};

export { registerUser, loginUser };
