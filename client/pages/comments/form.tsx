import { Form, Formik } from 'formik';
import Link from 'next/link';
import React from 'react';
import { IComment, IEmptyObject } from '../../../lib/types.js';
import { session } from '../../globalStore/store.js';
import {
  emptyObject,
  ErrorMessage,
  Field,
  getUrl,
  SubmitBtn,
  useContext,
} from '../../lib/utils.js';

interface IForm {
  onSubmit: any;
  type?: any;
  comment?: IComment | IEmptyObject;
}

const CommentsForm = (props: IForm, ref) => {
  const { onSubmit, comment = emptyObject, type = 'add' } = props;
  const { useStore } = useContext();
  const { isSignedIn } = useStore(session);
  const isNewCommentForm = type === 'add';
  const canShowGuestName =
    (isNewCommentForm && !isSignedIn) || (!isNewCommentForm && !comment.author_id);

  return (
    <Formik
      initialValues={{ guest_name: comment.guest_name, text: comment.text }}
      onSubmit={onSubmit}
    >
      <Form ref={ref}>
        <div className="row">
          <div className="col-6">
            {canShowGuestName && (
              <div className="mb-4">
                <label>Guest name</label>
                <Field className="input" name="guest_name" />
                <ErrorMessage name="guest_name" />
              </div>
            )}
            <div>
              {isNewCommentForm && <label>Text</label>}
              <Field as="textarea" className="input" name="text" />
              <ErrorMessage name="text" />
            </div>
          </div>
        </div>

        {isNewCommentForm && (
          <div className="mt-5">
            <Link href={getUrl('articles')} className="mr-4">
              Back
            </Link>

            <SubmitBtn className="btn">Save</SubmitBtn>
          </div>
        )}
      </Form>
    </Formik>
  );
};

export default React.forwardRef(CommentsForm);
