/** @jsx h */
import 'preact/debug';
import { h, Fragment, VNode } from 'preact';
import { Suspense } from 'preact/compat';
import { useEffect, useState } from 'preact/hooks';

interface StatusPending {
  status: 'pending';
  value: Promise<void>;
}
interface StatusSuccess<T> {
  status: 'success';
  value: T;
}

interface StatusFailure {
  status: 'failure';
  value: any;
}

type StatusResult<T> =
  | StatusPending
  | StatusFailure
  | StatusSuccess<T>;


interface Resource<T> {
  read(): T;
  load(): void;
}

function createResource<T>(provider: () => Promise<T>): Resource<T> {
  let status: StatusResult<T> | undefined;

  const listeners = new Set<() => void>();

  return {
    read(): T {
      const [, setState] = useState([]);

      useEffect(() => {
        const onUpdate = () => {
          setState([]);
        };

        listeners.add(onUpdate);

        return () => {
          listeners.delete(onUpdate);
        };
      }, []);


      if (!status) {
        status = {
          status: 'pending',
          value: provider().then(
            (value) => {
              status = {
                status: 'success',
                value,
              };
            },
            (value) => {
              status = {
                status: 'failure',
                value,
              };
            },
          ),
        };
      }

      if (status.status === 'success') {
        return status.value;
      }

      throw status.value;
    },
    load(): void {
      status = {
        status: 'pending',
        value: provider().then(
          (value) => {
            status = {
              status: 'success',
              value,
            };
            listeners.forEach((listener) => {
              listener();
            });
          },
          (value) => {
            status = {
              status: 'failure',
              value,
            };
            listeners.forEach((listener) => {
              listener();
            });
          },
        ),
      };
      listeners.forEach((listener) => {
        listener();
      });
    },
  }
}

const resource = createResource(() => new Promise((resolve) => {
  setTimeout(() => {
    resolve('Hello World');
  }, 500);
}));

function Details() {
  const value = resource.read();

  return <h1>Message: {value}</h1>
}

// function App() {
//   return (
//     <>
//       <Suspense fallback={<h1>Loading...</h1>}>
//         <div>
//           <Details />
//         </div>
//       </Suspense>
//       <Suspense fallback={<h1>Loading...</h1>}>
//         <div>
//           <Details />
//         </div>
//       </Suspense>
//     </>
//   );
// }

export default function App() {
  return (
    <>
      <button type="button" onClick={resource.load}>
        Reload (Click rapidly to reproduce error)
      </button>
      <h1>Single Child</h1>
      <Suspense fallback={<h1>Loading...</h1>}>
        <Details />
      </Suspense>
      <Suspense fallback={<h1>Loading...</h1>}>
        <Details />
      </Suspense>
      <Suspense fallback={<h1>Loading...</h1>}>
        <Details />
      </Suspense>
      <Suspense fallback={<h1>Loading...</h1>}>
        <Details />
      </Suspense>
      <Suspense fallback={<h1>Loading...</h1>}>
        <Details />
      </Suspense>
      <Suspense fallback={<h1>Loading...</h1>}>
        <Details />
      </Suspense>
      <Suspense fallback={<h1>Loading...</h1>}>
        <Details />
      </Suspense>
      <h1>Multi Child</h1>
      <Suspense fallback={<h1>Loading...</h1>}>
        <Details />
        <Details />
        <Details />
        <Details />
        <Details />
        <Details />
        <Details />
      </Suspense>
    </>
  );
}