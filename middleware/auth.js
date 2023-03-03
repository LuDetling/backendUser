const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");
    const userId = decodedToken.userId;
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    req.user = user;
    if (!req.user) {
      throw "User ID non valable !";
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({
      error: error.message | "Requête non authentifiée !",
    });
  }
};