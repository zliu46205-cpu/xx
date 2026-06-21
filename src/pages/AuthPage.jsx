import { useState } from "react";
import { Button, Notice } from "../components/Primitives";
import { loginAdmin, loginUser, registerUser } from "../utils/api";

export function AuthPage({ type, setRoute, onAuth }) {
  const isAdmin = type === "admin";
  const [mode, setMode] = useState("login");
  const [values, setValues] = useState({ account: "", password: "", code: "", nickname: "" });
  const [notice, setNotice] = useState("");
  const [status, setStatus] = useState("idle");

  function update(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setNotice("");
    if (!values.account || !values.password) {
      setNotice("请填写账号与密码。大众用户可以用邮箱或手机号注册，管理员需要后台密钥配置后才能进入。");
      return;
    }
    if (isAdmin && !values.code) {
      setNotice("管理员登录需要二次验证码。正式上线时应使用 2FA 或一次性验证码。");
      return;
    }

    setStatus("loading");
    try {
      const payload = isAdmin
        ? await loginAdmin(values)
        : mode === "register"
          ? await registerUser(values)
          : await loginUser(values);
      onAuth(payload.session);
      setNotice(isAdmin ? "管理员校验通过。" : "登录成功，已进入用户中心。");
      setRoute(isAdmin ? "admin-dashboard" : "account");
    } catch (error) {
      setNotice(error.message || "登录失败。若后端未配置，可先使用游客体验。");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card auth-card-wide">
        <span className="seal">{isAdmin ? "后台入口" : "大众用户"}</span>
        <h1>{isAdmin ? "管理员登录" : mode === "register" ? "创建账号" : "用户登录"}</h1>
        <p>
          {isAdmin
            ? "用于查看订单、用户、报告记录和系统运行状态。公开部署时必须配置后台密钥，不提供默认管理员。"
            : "登录后可以保存报告、查看历史、管理次数权益，并在后续接入真实支付后解锁完整报告。"}
        </p>

        {!isAdmin ? (
          <div className="segmented">
            <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>登录</button>
            <button type="button" className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>注册</button>
          </div>
        ) : null}

        <form onSubmit={submit}>
          {mode === "register" && !isAdmin ? (
            <label>
              昵称
              <input value={values.nickname} onChange={(event) => update("nickname", event.target.value)} placeholder="例如：观象用户" />
            </label>
          ) : null}
          <label>
            {isAdmin ? "管理员账号" : "手机号 / 邮箱"}
            <input value={values.account} onChange={(event) => update("account", event.target.value)} placeholder={isAdmin ? "由后台环境变量配置" : "用于登录和找回报告"} />
          </label>
          <label>
            密码
            <input type="password" value={values.password} onChange={(event) => update("password", event.target.value)} />
          </label>
          {isAdmin ? (
            <label>
              二次验证码
              <input value={values.code} onChange={(event) => update("code", event.target.value)} placeholder="正式上线建议接入 2FA" />
            </label>
          ) : null}
          <Notice type={notice.includes("失败") || notice.includes("需要") ? "error" : "info"}>{notice}</Notice>
          <div className="form-actions">
            <Button type="submit" disabled={status === "loading"}>{status === "loading" ? "处理中..." : isAdmin ? "进入管理后台" : mode === "register" ? "注册并登录" : "登录"}</Button>
            <Button type="button" variant="secondary" onClick={() => setRoute("consult")}>游客体验</Button>
          </div>
        </form>
      </div>
    </section>
  );
}
