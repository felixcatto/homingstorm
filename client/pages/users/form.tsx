import { Form, Formik } from 'formik';
import Link from 'next/link';
import { IEmptyObject, IUser } from '../../../lib/types.js';
import {
  ErrorMessage,
  Field,
  SubmitBtn,
  UsualSelect,
  emptyObject,
  getUrl,
  roles,
  toSelectOptions,
} from '../../lib/utils.js';

interface IForm {
  onSubmit: any;
  user?: IUser | IEmptyObject;
}

const UserForm = (props: IForm) => {
  const { onSubmit, user = emptyObject } = props;
  return (
    <Formik
      initialValues={{
        name: user.name,
        role: user.role || roles.user,
        email: user.email,
        password: '',
      }}
      onSubmit={onSubmit}
    >
      <Form>
        <div className="row mb-5">
          <div className="col-6">
            <div className="mb-4">
              <label>Name</label>
              <Field className="input" name="name" />
              <ErrorMessage name="name" />
            </div>
            <div className="mb-4">
              <label>Role</label>
              <UsualSelect
                name="role"
                options={toSelectOptions(Object.values(roles).filter(el => el !== roles.guest))}
                defaultItem={{ label: roles.user, value: roles.user }}
              />
              <ErrorMessage name="role" />
            </div>
            <div className="mb-4">
              <label>Email</label>
              <Field className="input" name="email" />
              <ErrorMessage name="email" />
            </div>
            <div>
              <label>Password</label>
              <Field className="input" type="password" name="password" />
              <ErrorMessage name="password" />
            </div>
          </div>
        </div>

        <Link href={getUrl('users')} className="mr-4">
          Back
        </Link>
        <SubmitBtn className="btn">Save</SubmitBtn>
      </Form>
    </Formik>
  );
};

export default UserForm;
