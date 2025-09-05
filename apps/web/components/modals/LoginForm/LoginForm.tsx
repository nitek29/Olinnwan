import './LoginForm.scss';

interface LoginFormProps {
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  error: string | null;
}

export default function LoginForm({ handleSubmit, error }: LoginFormProps) {
  return (
    <div className="login_modal">
      <h3 className="login_modal_title">Connexion</h3>
      <form onSubmit={handleSubmit} className="login_modal_form">
        <label htmlFor="username" className="login_modal_form_label">
          <span>Username:</span>
          <input
            type="text"
            name="username"
            id="username"
            required
            placeholder="Username"
            className="login_modal_form_label_input"
          />
        </label>

        <label htmlFor="password" className="login_modal_form_label">
          <span>Mot de passe:</span>
          <input
            type="password"
            name="password"
            id="password"
            required
            title="Le mot de passe ne respecte pas les conditions minimales de sécurité"
            placeholder="Mot de passe"
            className="login_modal_form_label_input"
          />
        </label>

        <button
          type="submit"
          aria-label="login"
          className="login_modal_form_button button"
        >
          Se connecter
        </button>
      </form>

      {error && <p className="login_modal_error">{error}</p>}
    </div>
  );
}
