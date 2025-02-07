import "@testing-library/jest-dom";
import { TW_VARS } from "@tw-classed/core";
import React from "react";
import { describe } from "vitest";
import { classed } from "../";
import { render, screen } from "./test.utils";

describe("Classed", () => {
  it("Should render dom element", () => {
    const Button = classed("button");

    render(<Button data-testid="btn" />);

    expect(screen.getByTestId("btn")).toBeInTheDocument();
  });

  it("Should render dom element with class", () => {
    const Button = classed("button");

    render(<Button className="test" data-testid="btn" />);

    expect(screen.getByTestId("btn")).toHaveClass("test");
  });

  it("Should render dom element with classed classNames", () => {
    const Button = classed("button", "bg-blue-500");

    render(<Button data-testid="btn" />);

    expect(screen.getByTestId("btn")).toHaveClass("bg-blue-500");
  });

  it("Should render dom element with classed classNames and class", () => {
    const Button = classed("button", "bg-blue-500");

    render(<Button className="test" data-testid="btn" />);

    expect(screen.getByTestId("btn")).toHaveClass("bg-blue-500 test");
  });

  it("Should render correct dom element", () => {
    const Anchor = classed("a");

    render(<Anchor href="#" data-testid="anchor" />);

    expect(screen.getByTestId("anchor")).toHaveAttribute("href", "#");
    expect(screen.getByTestId("anchor")).toBeInstanceOf(HTMLAnchorElement);
  });
});

describe("Classed with Variants", () => {
  it("Should render dom element with classed classNames and class", () => {
    const Button = classed("button", {
      variants: {
        color: {
          blue: "bg-blue-100",
        },
      },
    });

    render(<Button color="blue" className="test" data-testid="btn" />);

    expect(screen.getByTestId("btn")).toHaveClass("bg-blue-100");
  });

  it("Should not render any variant if no variant is passed", () => {
    const Button = classed("button", {
      variants: {
        color: {
          blue: "bg-blue-100",
        },
      },
    });

    render(<Button className="test" data-testid="btn" />);

    expect(screen.getByTestId("btn")).not.toHaveClass("bg-blue-100");
  });

  it("Should render dom element with correct default variant", () => {
    const Button = classed("button", {
      variants: {
        color: {
          blue: "bg-blue-100",
        },
      },

      defaultVariants: {
        color: "blue",
      },
    });

    render(<Button data-testid="btn" />);

    expect(screen.getByTestId("btn")).toHaveClass("bg-blue-100");
  });

  it("Should prefer props over defaultVariants", () => {
    const Button = classed("button", {
      variants: {
        color: {
          blue: "bg-blue-100",
          red: "bg-red-100",
        },
      },

      defaultVariants: {
        color: "red",
      },
    });

    render(<Button color="blue" data-testid="btn" />);

    expect(screen.getByTestId("btn")).toHaveClass("bg-blue-100");
    expect(screen.getByTestId("btn")).not.toHaveClass("bg-red-100");
  });

  it("Should accept boolean variant", () => {
    const Button = classed("button", {
      variants: {
        bordered: {
          true: "border-2 border-gray-500",
        },
        color: {
          blue: "bg-blue-100",
          red: "bg-red-100",
        },
      },
    });

    render(<Button color="red" bordered data-testid="btn" />);

    expect(screen.getByTestId("btn")).toHaveClass("border-2 border-gray-500");
  });

  it("Should handle numerical variants", () => {
    const Button = classed("button", {
      variants: {
        size: {
          1: "text-xs",
          2: "text-sm",
          3: "text-base",
          "4": "text-lg",
        },
      },
    });

    const Button2 = classed("button", {
      variants: {
        size: {
          1: "text-xs",
          2: "text-sm",
          3: "text-base",
        },
      },

      defaultVariants: {
        size: "3",
      },
    });

    render(<Button size={"4"} data-testid="btn" />);

    expect(screen.getByTestId("btn")).toHaveClass("text-lg");

    render(<Button2 data-testid="btn2" />);
    expect(screen.getByTestId("btn2")).toHaveClass("text-base");
  });
});

describe("Composition", () => {
  it("Should merge class of other classed component", () => {
    const Button = classed("button", "bg-blue-100");
    const Anchor = classed(Button, "bg-red-100");

    render(<Anchor data-testid="btn" />);

    expect(screen.getByTestId("btn")).toHaveClass("bg-blue-100 bg-red-100");
  });

  it("Should merge class of other classed component with variants", () => {
    const Button = classed("button", {
      variants: {
        color: {
          blue: "bg-blue-100",
          red: "bg-red-100",
        },
      },
    });
    const Anchor = classed(Button, "bg-red-100");

    render(<Anchor color="blue" data-testid="btn" />);

    expect(screen.getByTestId("btn")).toHaveClass("bg-blue-100 bg-red-100");
  });

  it("Should include variants of other classed component", () => {
    const Button = classed("button", {
      variants: {
        color: {
          blue: "bg-blue-100",
          red: "bg-red-100",
        },
      },
    });

    const Anchor = classed("a", Button);

    render(<Anchor color="blue" data-testid="btn" />);

    expect(screen.getByTestId("btn")).toHaveClass("bg-blue-100");
  });

  it("Should correctly support boolean variants", () => {
    const BasicButton = classed("button", {
      variants: { loading: { true: "animate-pulse" } },
    });

    const ButtonContent = classed("div", {
      variants: { loading: { false: "invisible" } },
    });

    const Button = ({
      loading,
      children,
      ...props
    }: React.ComponentProps<typeof BasicButton>) => (
      <BasicButton loading={loading} {...props}>
        <ButtonContent
          data-testid={(props as any)["data-innertestid"]}
          loading={loading}
        >
          {children}
        </ButtonContent>
        {/* => Type 'boolean | "true" | undefined' is not assignable to type 'boolean | "false" | undefined'. */}
      </BasicButton>
    );

    render(
      <Button data-testid="a1" data-innertestid="a2" loading={false}>
        Click me
      </Button>
    );
    expect(screen.getByTestId("a1")).not.toHaveClass("animate-pulse");
    expect(screen.getByTestId("a2")).toHaveClass("invisible");

    render(
      <Button data-testid="b1" data-innertestid="b2" loading={true}>
        Click me
      </Button>
    );
    expect(screen.getByTestId("b1")).toHaveClass("animate-pulse");
    expect(screen.getByTestId("b2")).not.toHaveClass("invisible");
  });
});
