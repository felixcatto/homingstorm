import { Form, Formik } from 'formik';
import Link from 'next/link';
import { IArticle, IEmptyObject, ITag } from '../../../lib/types.js';
import {
  ErrorMessage,
  FMultiSelect,
  Field,
  SubmitBtn,
  emptyObject,
  getUrl,
} from '../../lib/utils.js';

interface IForm {
  onSubmit: any;
  tags: ITag[];
  article?: IArticle | IEmptyObject;
}

const ArticlesForm = (props: IForm) => {
  const { onSubmit, tags, article = emptyObject } = props;
  const transformTag = tag => ({ value: tag.id, label: tag.name });
  const tagsForSelect = tags.map(transformTag);
  const articleTags = article.tags || [];
  const selectedTags = articleTags.map(transformTag);
  const tagIds = articleTags.map(tag => tag.id);

  return (
    <Formik
      initialValues={{
        title: article.title,
        text: article.text,
        tagIds,
      }}
      onSubmit={onSubmit}
    >
      <Form>
        <div className="row mb-5">
          <div className="col-6">
            <div className="mb-4">
              <label>Title</label>
              <Field className="input" name="title" />
              <ErrorMessage name="title" />
            </div>
            <div className="mb-4">
              <label>Text</label>
              <Field className="input" as="textarea" name="text" />
            </div>
            <div>
              <label>Tags</label>
              <FMultiSelect name="tagIds" options={tagsForSelect} defaultOptions={selectedTags} />
            </div>
          </div>
        </div>

        <Link href={getUrl('articles')} className="mr-4">
          Back
        </Link>
        <SubmitBtn className="btn">Save</SubmitBtn>
      </Form>
    </Formik>
  );
};

export default ArticlesForm;
