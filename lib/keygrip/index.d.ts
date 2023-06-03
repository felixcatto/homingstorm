declare module 'keygrip' {
  export default function makeKeygrip(keys: string[]): {
    sign: (data: string) => string;
    index: (data: string, digest: string) => number;
    verify: (data: string, digest: string) => boolean;
  };
}
