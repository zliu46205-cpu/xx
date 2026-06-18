import { useState } from "react";
import { Button, Notice } from "../components/Primitives";

export function AuthPage({ type, setRoute }) {
  const isAdmin = type === "admin";
  const [values, setValues] = useState({ account: "", password: "", code: "" });
  const [notice, setNotice] = useState("");

  function submit(event) {
    event.preventDefault();
    if (!values.account || !values.password) {
      setNotice("请填写账号与密码。当前为前端演示，不会提交到服务器。");
      return;
    }
    if (isAdmin && !values.code) {
      setNotice("管理员登录需要二次验证码。真实上线还应加入 2FA、审计日志与权限隔离。");
      return;
    }
    setNotice(isAdmin ? "管理员演示登录通过：真实上线需接入后端权限系统。" : "用户演示登录通过：可继续体验报告流程。");
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <span className="seal">{isAdmin ? "后台入口" : "大众用户"}</span>
        <h1>{isAdmin ? "管理员登录" : "用户登录"}</h1>
        <p>{isAdmin ? "用于后续报告审核、内容管理和安全复核。" : "用于后续保存报告、管理资料和查看历史咨询。"}</p>

        <form onSubmit={submit}>
          <label>
            {isAdmin ? "管理员账号" : "手机号 / 邮箱"}
            <input value={values.account} onChange={(event) => setValues({ ...values, account: event.target.value })} />
          </label>
          <label>
            密码
            <input type="password" value={values.password} onChange={(event) => setValues({ ...values, password: event.target.value })} />
          </label>
          {isAdmin ? (
            <label>
              二次验证码
              <input value={values.code} onChange={(event) => setValues({ ...values, code: event.target.value })} placeholder="演示字段" />
            </label>
          ) : null}
          <Notice>{notice}</Notice>
          <div className="form-actions">
            <Button type="submit">{isAdmin ? "进入管理后台" : "登录并继续"}</Button>
            <Button type="button" variant="secondary" onClick={() => setRoute("consult")}>游客体验</Button>
          </div>
        </form>
      </div>
    </section>
  );
}
