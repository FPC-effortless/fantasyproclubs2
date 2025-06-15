declare module 'react' {
  export * from 'react';
}

declare module 'next/navigation' {
  export function useRouter(): {
    push: (url: string) => void;
    replace: (url: string) => void;
    back: () => void;
    forward: () => void;
    refresh: () => void;
  };
  
  export function useSearchParams(): URLSearchParams;
}

declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  
  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
  }
  
  export type Icon = FC<IconProps>;
  
  export const Trophy: Icon;
  export const Users: Icon;
  export const Shield: Icon;
  export const Gamepad2: Icon;
  export const Heart: Icon;
  export const BarChart3: Icon;
  export const ChevronLeft: Icon;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

interface Window {
  openSignInModal?: () => void;
} 