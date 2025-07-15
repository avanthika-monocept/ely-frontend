import * as React from "react";
import Svg, { Path } from "react-native-svg";
const CopyClip = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={18}
    height={18}
    fill="none"
    {...props}
  >
    <Path
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.4}
      d="M3.493 11.898H2.87A1.87 1.87 0 0 1 1 10.028V2.87A1.87 1.87 0 0 1 2.87 1h7.158a1.87 1.87 0 0 1 1.87 1.87v.624"
    />
    <Path
      stroke="#fff"
      strokeLinejoin="round"
      strokeWidth={1.4}
      d="M15.13 6.102H7.972a1.87 1.87 0 0 0-1.87 1.87v7.158A1.87 1.87 0 0 0 7.972 17h7.158A1.87 1.87 0 0 0 17 15.13V7.972a1.87 1.87 0 0 0-1.87-1.87Z"
    />
  </Svg>
);
export default CopyClip;
