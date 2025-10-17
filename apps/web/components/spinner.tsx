'use client';

export const Spinner = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      aria-hidden="true"
      width="2rem"
      height="2rem"
    >
      <path className="spinner-path-1" d="M3 7H1a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2"></path>
      <path className="spinner-path-2" d="M15 7h-2a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2"></path>
      <path className="spinner-path-3" d="M7 13v2a1 1 0 1 0 2 0v-2a1 1 0 1 0-2 0"></path>
      <path className="spinner-path-4" d="M7 1v2a1 1 0 0 0 2 0V1a1 1 0 0 0-2 0"></path>
      <path
        className="spinner-path-5"
        d="m9.634 12.83 1 1.732a1 1 0 1 0 1.732-1l-1-1.732a1 1 0 0 0-1.732 1"
      ></path>
      <path
        className="spinner-path-6"
        d="m3.634 2.438 1 1.732a1 1 0 1 0 1.732-1l-1-1.732a1 1 0 1 0-1.732 1"
      ></path>
      <path
        className="spinner-path-7"
        d="m11.83 11.366 1.732 1a1 1 0 1 0 1-1.732l-1.732-1a1 1 0 1 0-1 1.732"
      ></path>
      <path
        className="spinner-path-8"
        d="m1.438 5.366 1.732 1a1 1 0 1 0 1-1.732l-1.732-1a1 1 0 1 0-1 1.732"
      ></path>
      <path
        className="spinner-path-9"
        d="m12.83 6.366 1.732-1a1 1 0 0 0-1-1.732l-1.732 1a1 1 0 0 0 1 1.732"
      ></path>
      <path
        className="spinner-path-10"
        d="m2.438 12.366 1.732-1a1 1 0 1 0-1-1.732l-1.732 1a1 1 0 1 0 1 1.732"
      ></path>
      <path
        className="spinner-path-11"
        d="m11.366 4.17 1-1.732a1 1 0 0 0-1.732-1l-1 1.732a1 1 0 0 0 1.732 1"
      ></path>
      <path
        className="spinner-path-12"
        d="m5.366 14.562 1-1.732a1 1 0 1 0-1.732-1l-1 1.732a1 1 0 0 0 1.732 1"
      ></path>

      <style jsx>{`
        @keyframes spinnerFade {
          0%,
          39%,
          100% {
            opacity: 0.25;
          }
          40% {
            opacity: 1;
          }
        }

        .spinner-path-1 {
          animation: spinnerFade 1.2s linear infinite;
          animation-delay: -1.1s;
        }
        .spinner-path-2 {
          animation: spinnerFade 1.2s linear infinite;
          animation-delay: -0.5s;
        }
        .spinner-path-3 {
          animation: spinnerFade 1.2s linear infinite;
          animation-delay: -0.9s;
        }
        .spinner-path-4 {
          animation: spinnerFade 1.2s linear infinite;
          animation-delay: -0.3s;
        }
        .spinner-path-5 {
          animation: spinnerFade 1.2s linear infinite;
          animation-delay: -0.8s;
        }
        .spinner-path-6 {
          animation: spinnerFade 1.2s linear infinite;
          animation-delay: -0.2s;
        }
        .spinner-path-7 {
          animation: spinnerFade 1.2s linear infinite;
          animation-delay: -0.7s;
        }
        .spinner-path-8 {
          animation: spinnerFade 1.2s linear infinite;
          animation-delay: -0.1s;
        }
        .spinner-path-9 {
          animation: spinnerFade 1.2s linear infinite;
          animation-delay: -0.6s;
        }
        .spinner-path-10 {
          animation: spinnerFade 1.2s linear infinite;
          animation-delay: 0s;
        }
        .spinner-path-11 {
          animation: spinnerFade 1.2s linear infinite;
          animation-delay: -0.4s;
        }
        .spinner-path-12 {
          animation: spinnerFade 1.2s linear infinite;
          animation-delay: -1s;
        }
      `}</style>
    </svg>
  );
};
