import nodemailer from "nodemailer"

export const enviarEmailDeRecuperacao = async (to, codigo) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    })

    await transporter.sendMail({
        from: `"Suporte --> " <${process.env.EMAIL_USER}`,
        to,
        subject: "Recuperação de Senha",
        text: `Seu código de recuperação é: ${codigo} (válido por 15 minutos).`
    })
}