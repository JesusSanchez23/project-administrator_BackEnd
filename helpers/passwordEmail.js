import nodemailer from "nodemailer";

export const passworEmail = async (datos) => {
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
    subject: "Recuperar Contraseña",
    text: `Haz solicitado recuperar tu contraseña`,
    html: `<p>Hola ${nombre}, Solicitaste recuperar tu contraseña</p>
    <p>Para ayudarte en el proceso, da clic en el siguiente enlace</p>
    
    <a href="${process.env.FRONTEND_URL}/olvide/${token}">Recuperar Contraseña</a>
    
    <p>Si no has solicitado el cambio, puede que alguien este intentando entyrar a tu cuenta, cambia tu contraseña</p>
    `,
  });
};
