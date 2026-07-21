// Type declarations for Google's <model-viewer> web component
// Allows TypeScript to recognize <model-viewer> as a valid JSX element

declare namespace React {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          poster?: string;
          alt?: string;
          "camera-controls"?: boolean | string;
          "auto-rotate"?: boolean | string;
          "auto-rotate-delay"?: string;
          "rotation-per-second"?: string;
          "camera-orbit"?: string;
          "min-camera-orbit"?: string;
          "max-camera-orbit"?: string;
          "field-of-view"?: string;
          "min-field-of-view"?: string;
          "max-field-of-view"?: string;
          "environment-image"?: string;
          "shadow-intensity"?: string;
          "shadow-softness"?: string;
          exposure?: string;
          loading?: string;
          reveal?: string;
          "tone-mapping"?: string;
          "disable-zoom"?: boolean | string;
        },
        HTMLElement
      >;
    }
  }
}
