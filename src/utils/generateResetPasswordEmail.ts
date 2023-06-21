const generateResetPasswordEmail = (username: string, resetPasswordUrl: string): string => {
  const url = process.env.NODE_ENV === "production" ? process.env.FRONT_REMOTE_URL : process.env.FRONT_LOCAL_URL;
  return `
    <html>
        <head>
        <style>
            *{
            font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans';
            letter-spacing: 1px;
            }
            a{
            text-decoration: none;
            color: #373737 !important;
            }
            header{
            display: block;
            padding: 20px;
            text-align: center;
            font-size: 25px;
            font-weight: 600;
            }
            section {
            width: 500px;
            margin: auto;
            border: 2px solid #efefef;
            color: #373737 !important;
            font-size: 16px;
            }
            div{
            padding: 20px;
            }
            .resetPassword {
            display: block;
            width: 200px;
            padding: 3px 0px;
            background: #262626;
            color: #fff !important;
            border-radius: 2px;
            text-align: center;
            margin: 20px auto;
            }
        </style>
        </head>
        <body>
        <section>
            <header><a href=${url} target="_blank">HOOKLOOP</a></header>
            <div>
            Hi ${username}, 
            <p>A request has been received to change the password for your HOOKLOOP account.</p>
            <p>Please reset your password in <b>10 minutes<b>.</p>
            <a href=${resetPasswordUrl} target="_blank" class="resetPassword">Reset Password</a>
            </div>
        </section>
        </body>
    </html>
    `;
};

export default generateResetPasswordEmail;
