import nodemailer from "nodemailer";

export const emailRegistro = async (datos) => {
  const { email, nombre, token } = datos;

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // información de envio de email
  const info = await transport.sendMail({
    from: '"Uptask - Administrador de proyectos" <Uptask@blentoom.com>',
    to: email,
    subject: "Confirmación de registro",
    text: `Confirma tu cuenta`,
    html: `<p>Hola ${nombre}, comprueba tu cuenta en UpTask</p>
    <p>Tu cuenta ya esta casi lista, da clic en el siguiente enlace</p>
    
    <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar cuenta</a>
    
    <p>Si no has solicitado una cuenta, ignora este mensaje</p>
    `,
  });
};
