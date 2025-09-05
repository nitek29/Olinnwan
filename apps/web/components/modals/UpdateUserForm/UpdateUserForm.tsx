import './UpdateUserForm.scss';

import { User } from '../../../types/user';

interface UpdateUserFormProps {
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  error: string | null;
  user?: User;
}

export default function UpdateUserForm({
  handleSubmit,
  error,
  user,
}: UpdateUserFormProps) {
  return (
    <div className="update_user_modal">
      <h3 className="update_user_modal_title">Modifier mes informations</h3>
      <form onSubmit={handleSubmit} className="update_user_modal_form">
        <label htmlFor="username" className="update_user_modal_form_label">
          <span>Nom d'utilisateur:</span>
          <input
            type="text"
            name="username"
            id="username"
            required
            defaultValue={user?.username || ''}
            placeholder="Nom d'utilisateur"
            className="update_user_modal_form_label_input"
          />
        </label>

        <label htmlFor="mail" className="update_user_modal_form_label">
          <span>Email:</span>
          <input
            type="email"
            name="mail"
            id="mail"
            required
            defaultValue=""
            placeholder="Email"
            className="update_user_modal_form_label_input"
          />
        </label>

        <label htmlFor="password" className="update_user_modal_form_label">
          <span>Nouveau mot de passe (optionnel):</span>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Nouveau mot de passe"
            className="update_user_modal_form_label_input"
          />
        </label>

        <label
          htmlFor="confirmPassword"
          className="update_user_modal_form_label"
        >
          <span>Confirmer le mot de passe:</span>
          <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            placeholder="Confirmer le mot de passe"
            className="update_user_modal_form_label_input"
          />
        </label>

        {error && <p className="update_user_modal_form_error">{error}</p>}

        <button type="submit" className="update_user_modal_form_submit">
          Mettre à jour
        </button>
      </form>
    </div>
  );
}
