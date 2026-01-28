import { cn } from "@/utils/lib/utils";
import { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement> & {
  secondaryfill?: string;
  strokewidth?: number;
  title?: string;
};

function RemarkLogo({
  className,
  title = "",
  ...props
}: IconProps & {
  className?: string;
}) {
  return (
    <svg
      className={cn("size-6", className)}
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>{title}</title>
      <g filter="url(#filter0_d_1335_113)">
        <g
          clipPath="url(#paint0_angular_1335_113_clip_path)"
          data-figma-skip-parse="true"
        >
          <g transform="matrix(0 0.00985025 -0.00985025 0 13.8503 9.85025)">
            <foreignObject
              x="-1101.52"
              y="-1101.52"
              width="2203.04"
              height="2203.04"
            >
              <div
                style={{
                  background:
                    "conic-gradient(from 90deg,rgba(70, 70, 70, 1) 0deg,rgba(7, 7, 7, 1) 36.3381deg,rgba(216, 216, 216, 1) 122.881deg,rgba(0, 0, 0, 1) 258.359deg,rgba(142, 142, 142, 1) 318.469deg,rgba(70, 70, 70, 1) 360deg)",
                  height: "100%",
                  width: "100%",
                  opacity: "1",
                }}
              ></div>
            </foreignObject>
          </g>
        </g>
        <rect
          x="4"
          width="19.7005"
          height="19.7005"
          rx="6"
          data-figma-gradient-fill="{&#34;type&#34;:&#34;GRADIENT_ANGULAR&#34;,&#34;stops&#34;:[{&#34;color&#34;:{&#34;r&#34;:0.031193660572171211,&#34;g&#34;:0.029280962422490120,&#34;b&#34;:0.029280962422490120,&#34;a&#34;:1.0},&#34;position&#34;:0.10093905776739120},{&#34;color&#34;:{&#34;r&#34;:0.84972202777862549,&#34;g&#34;:0.84972202777862549,&#34;b&#34;:0.84972202777862549,&#34;a&#34;:1.0},&#34;position&#34;:0.34133720397949219},{&#34;color&#34;:{&#34;r&#34;:0.0,&#34;g&#34;:0.0,&#34;b&#34;:0.0,&#34;a&#34;:1.0},&#34;position&#34;:0.71766519546508789},{&#34;color&#34;:{&#34;r&#34;:0.55759841203689575,&#34;g&#34;:0.55759841203689575,&#34;b&#34;:0.55759841203689575,&#34;a&#34;:1.0},&#34;position&#34;:0.88463705778121948}],&#34;stopsVar&#34;:[{&#34;color&#34;:{&#34;r&#34;:0.031193660572171211,&#34;g&#34;:0.029280962422490120,&#34;b&#34;:0.029280962422490120,&#34;a&#34;:1.0},&#34;position&#34;:0.10093905776739120},{&#34;color&#34;:{&#34;r&#34;:0.84972202777862549,&#34;g&#34;:0.84972202777862549,&#34;b&#34;:0.84972202777862549,&#34;a&#34;:1.0},&#34;position&#34;:0.34133720397949219},{&#34;color&#34;:{&#34;r&#34;:0.0,&#34;g&#34;:0.0,&#34;b&#34;:0.0,&#34;a&#34;:1.0},&#34;position&#34;:0.71766519546508789},{&#34;color&#34;:{&#34;r&#34;:0.55759841203689575,&#34;g&#34;:0.55759841203689575,&#34;b&#34;:0.55759841203689575,&#34;a&#34;:1.0},&#34;position&#34;:0.88463705778121948}],&#34;transform&#34;:{&#34;m00&#34;:1.2063077951837242e-15,&#34;m01&#34;:-19.700500488281250,&#34;m02&#34;:23.700500488281250,&#34;m10&#34;:19.700500488281250,&#34;m11&#34;:1.2063077951837242e-15,&#34;m12&#34;:-1.2063077951837242e-15},&#34;opacity&#34;:1.0,&#34;blendMode&#34;:&#34;NORMAL&#34;,&#34;visible&#34;:true}"
        />
        <rect
          x="4.5"
          y="0.5"
          width="18.7005"
          height="18.7005"
          rx="5.5"
          stroke="white"
          strokeOpacity="0.45"
        />
      </g>
      <path
        opacity="0.64"
        d="M16.1824 10.3228L16.2537 10.4517L18.7 14.8696C18.9766 15.3695 18.6151 15.9829 18.0438 15.9829H15.5623C15.2856 15.9829 15.0307 15.8304 14.9002 15.5864L12.285 10.6909L12.0887 10.3228H16.1824Z"
        fill="white"
        stroke="#BBBBBB"
        strokeWidth="0.5"
      />
      <path
        d="M14.2202 3.71777C15.2209 3.71779 16.0929 3.87914 16.8276 4.21094H16.8266C17.5726 4.53151 18.1515 5.01015 18.5502 5.65039C18.9496 6.29174 19.142 7.06307 19.142 7.95117C19.142 9.24607 18.7031 10.2841 17.809 11.0332V11.0342C16.9317 11.7672 15.7244 12.1172 14.2202 12.1172H12.2514V15.2334C12.2511 15.6474 11.9155 15.9834 11.5014 15.9834H9.30804C8.89399 15.9834 8.55831 15.6474 8.55804 15.2334V5.46777C8.55804 4.50128 9.34155 3.71777 10.308 3.71777H14.2202ZM12.2514 9.0957H13.8168C14.3876 9.09568 14.7752 8.99237 15.017 8.82227C15.2404 8.65462 15.3646 8.40178 15.3647 8.01855C15.3647 7.62238 15.2343 7.3641 14.9995 7.19629L14.9955 7.19434C14.7539 7.01535 14.3733 6.90725 13.8168 6.90723H12.2514V9.0957Z"
        fill="white"
        stroke="#A7A7A7"
        strokeWidth="0.5"
      />
      <defs>
        <filter
          id="filter0_d_1335_113"
          x="0"
          y="0"
          width="27.7005"
          height="27.7007"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_1335_113"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_1335_113"
            result="shape"
          />
        </filter>
        <clipPath id="paint0_angular_1335_113_clip_path">
          <rect x="4" width="19.7005" height="19.7005" rx="6" />
        </clipPath>
      </defs>
    </svg>
  );
}

export default RemarkLogo;
