import { Form, Formik } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../client/common/Layout.js';
import {
  ErrorMessage,
  Field,
  SubmitBtn,
  WithApiErrors,
  getApiUrl,
  getUrl,
  roles,
  useContext,
  useSetGlobalState,
  useSubmit,
  wsEvents,
} from '../../client/lib/utils.js';
import { send } from '../../client/lib/wsActor.js';
import { TContent, TTrigger, Tooltip } from '../../client/ui/Tooltip.js';
import { keygrip, orm } from '../../lib/init.js';
import {
  IGetSessionResponse,
  IPostSessionResponse,
  IUser,
  IUserLoginCreds,
} from '../../lib/types.js';
import { getGenericProps } from '../../lib/utils.js';

export async function getServerSideProps(ctx) {
  const adminUser = await orm.User.query().findOne('role', roles.admin);
  const props = await getGenericProps({ ctx, keygrip, orm }, { adminUser });
  return { props };
}

const LoginForm = props => {
  const adminUser: IUser = props.adminUser;
  const { axios, wsActor } = useContext();
  const setGlobalState = useSetGlobalState();
  const router = useRouter();

  const onSubmit = useSubmit(async (userCreds: IUserLoginCreds) => {
    const user = await axios.post<IPostSessionResponse>(getApiUrl('session'), userCreds);
    setGlobalState({ currentUser: user });
    router.push(getUrl('home'));

    const data = await axios.get<IGetSessionResponse>(getApiUrl('session'));
    send(wsActor, wsEvents.signIn, data);
  });

  return (
    <Layout>
      <h3 className="flex">
        <div className="mr-2">Login form</div>
        <Tooltip offset={2} placement="right" className="inline-flex" theme="outline">
          <TTrigger>
            <i className="flex items-center far fa-circle-question fa_hint"></i>
          </TTrigger>
          <TContent>
            <div className="py-1 px-2">
              <div>Email - use any email from `Users` page</div>
              <div>Password - 1</div>
            </div>
          </TContent>
        </Tooltip>
      </h3>

      <Formik initialValues={{ email: adminUser.email, password: '1' }} onSubmit={onSubmit}>
        <Form>
          <div className="row mb-5">
            <div className="col-6">
              <div className="mb-4">
                <label>Email</label>
                <Field className="input" name="email" data-test="email" />
                <ErrorMessage name="email" />
              </div>
              <div>
                <label>Password</label>
                <Field className="input" type="password" name="password" data-test="password" />
                <ErrorMessage name="password" />
              </div>
            </div>
          </div>
          <Link href={getUrl('home')} className="mr-4">
            Cancel
          </Link>
          <SubmitBtn className="btn" data-test="signInFormSubmit">
            Sign in
          </SubmitBtn>
        </Form>
      </Formik>
    </Layout>
  );
};

export default WithApiErrors(LoginForm);
