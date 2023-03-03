const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const yup = require("yup");

const prisma = new PrismaClient();

exports.addUser = async (req, res, next) => {
    try {
        // création du schema yup pour sécurité
        console.log(req.body)
        let schemaUser = yup.object().shape({
            firstName: yup.string().required(),
            lastName: yup.string().required(),
            email: yup.string().required().email(),
            password: yup.string().min(8).required(),
        });
        // récupération de la requete
        const fetchUser = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
        };
        const hash = await bcrypt.hash(req.body.password, 10);
        const user = await schemaUser.validate(fetchUser);
        // si les vérifications de yup ont fonctionné
        // alors on transforme le mot de passe
        if (user) {
            fetchUser.password = hash;
            await prisma.user.create({ data: fetchUser });
            res.status(201).json({
                message: "Utilisateur créé !",
            });
        }
    } catch (error) {
        res.status(500).json({
            error,
        });
        console.log(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: req.body.email,
            },
        });
        if (!user) {
            return res.status(401).json({
                error: "Utilisateur non trouvé !",
            });
        }
        const valid = await bcrypt.compare(req.body.password, user.password);
        if (!valid) {
            return res.status(401).json({
                error: "Mot de passe incorrect !",
            });
        }
        res.status(200).json({
            userId: user.id,
            token: jwt.sign(
                {
                    userId: user.id,
                },
                "RANDOM_TOKEN_SECRET",
                {
                    expiresIn: "24h",
                }
            ),
            statut: user.statut,
        });
    } catch (error) {
        res.status(500).json({
            error,
        });
    }
};