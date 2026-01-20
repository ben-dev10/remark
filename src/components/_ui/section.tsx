import React from "react";

type SectionElement = "section" | "div" | "footer" | "header" | "main" | "nav";

type ContainerSize = "5xl" | "6xl" | "7xl" | "8xl" | "none";

type RootElementProps<T extends SectionElement = "section"> =
  React.ComponentPropsWithoutRef<T> & {
    as?: T;
  };

type ContainerProps = React.ComponentPropsWithoutRef<"div"> & {
  container?: ContainerSize;
};

const RootElement = <T extends SectionElement = "section">({
  as,
  className = "bg-background",
  children,
  ...props
}: RootElementProps<T>) => {
  const Element = (as || "section") as React.ElementType;

  return (
    <Element className={className} {...props}>
      {children}
    </Element>
  );
};

const Container: React.FC<ContainerProps> = ({
  container = "7xl",
  className = "",
  children,
  ...props
}) => {
  const containerDataType = `container-${container}`;

  return (
    <div datatype={containerDataType} className={className} {...props}>
      {children}
    </div>
  );
};

const Section = {
  RootElement,
  Container,
};

export default Section;
