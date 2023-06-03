import Image from 'next/image.js';
import Layout from '../client/common/Layout.js';
import { keygrip, orm } from '../lib/init.js';
import { getGenericProps } from '../lib/utils.js';

export async function getServerSideProps(ctx) {
  const props = await getGenericProps({ ctx, keygrip, orm });
  return { props };
}

export default function Home() {
  return (
    <Layout>
      <div className="splash-screen">
        <Image
          src="/img/s6.jpg"
          className="splash-screen__img"
          quality={100}
          fill
          priority
          alt=""
        />
      </div>
    </Layout>
  );
}
