import stripedBackground, { AngleString } from "./index";

describe("stripedBackground", () => {
  test("empty pattern", () => {
    expect(stripedBackground([])).toEqual({});
  });

  test("single color pattern", () => {
    expect(stripedBackground([["rgba(4, 3, 2, 1)", 30]])).toEqual({
      backgroundColor: "rgba(4, 3, 2, 1)",
    });
  });

  test("default angle and offset", () => {
    expect(
      stripedBackground([
        ["red", 10],
        ["tan", 10],
      ]),
    ).toEqual({
      backgroundImage:
        "linear-gradient(45deg, red 10px, tan 10px, tan 20px, red 20px, red 30px, tan 30px)",
      backgroundPosition: "top 0px left 0px",
      backgroundSize: "28.2843px 28.2843px",
    });
  });

  test("invalid angle string", () => {
    expect(() =>
      stripedBackground(
        [
          ["red", 10],
          ["tan", 10],
        ],
        "invalid" as any,
      ),
    ).toThrow("Unable to parse angle: invalid");
  });

  test("invalid angle unit", () => {
    expect(() =>
      stripedBackground(
        [
          ["red", 10],
          ["tan", 10],
        ],
        "45degrees" as any,
      ),
    ).toThrow("Unable to parse angle: 45degrees");
  });

  test.each<{
    angle: number | AngleString;
    expAngle: string;
    expSize: string;
  }>([
    { angle: 30, expAngle: "30deg", expSize: "40px 23.094px" },
    { angle: "30", expAngle: "30deg", expSize: "40px 23.094px" },
    { angle: "30deg", expAngle: "30deg", expSize: "40px 23.094px" },
    { angle: "0.1turn", expAngle: "0.1turn", expSize: "34.026px 24.7214px" },
    { angle: "0.5rad", expAngle: "0.5rad", expSize: "41.7166px 22.7899px" },
    { angle: "30grad", expAngle: "30grad", expSize: "44.0538px 22.4465px" },
  ])("different angle formats", ({ angle, expAngle, expSize }) => {
    expect(
      stripedBackground(
        [
          ["red", 10],
          ["tan", 10],
        ],
        angle,
      ),
    ).toEqual({
      backgroundImage: `linear-gradient(${expAngle}, red 9.5px, tan 10.5px, tan 19.5px, red 20.5px, red 29.5px, tan 30.5px)`,
      backgroundPosition: "top 0px left 0px",
      backgroundSize: expSize,
    });
  });

  test.each([
    { angle: -390, expAngle: "-30deg", expSize: "40px 23.094px" },
    { angle: -330, expAngle: "30deg", expSize: "40px 23.094px" },
    { angle: -210, expAngle: "150deg", expSize: "40px 23.094px" },
    { angle: -150, expAngle: "-150deg", expSize: "40px 23.094px" },
    { angle: -30, expAngle: "-30deg", expSize: "40px 23.094px" },
    { angle: 30, expAngle: "30deg", expSize: "40px 23.094px" },
    { angle: 150, expAngle: "150deg", expSize: "40px 23.094px" },
    { angle: 210, expAngle: "-150deg", expSize: "40px 23.094px" },
    { angle: 330, expAngle: "-30deg", expSize: "40px 23.094px" },
    { angle: 390, expAngle: "30deg", expSize: "40px 23.094px" },
  ])("angle normalization", ({ angle, expAngle, expSize }) => {
    expect(
      stripedBackground(
        [
          ["red", 10],
          ["tan", 10],
        ],
        angle,
      ),
    ).toEqual({
      backgroundImage: `linear-gradient(${expAngle}, red 9.5px, tan 10.5px, tan 19.5px, red 20.5px, red 29.5px, tan 30.5px)`,
      backgroundPosition: "top 0px left 0px",
      backgroundSize: expSize,
    });
  });

  test.each([
    { angle: -180, expSize: "1px 20px" },
    { angle: -135, expSize: "28.2843px 28.2843px" },
    { angle: -90, expSize: "20px 1px" },
    { angle: -45, expSize: "28.2843px 28.2843px" },
    { angle: 0, expSize: "1px 20px" },
    { angle: 45, expSize: "28.2843px 28.2843px" },
    { angle: 90, expSize: "20px 1px" },
    { angle: 135, expSize: "28.2843px 28.2843px" },
    { angle: 180, expSize: "1px 20px" },
  ])("angle is multiple of 45", ({ angle, expSize }) => {
    expect(
      stripedBackground(
        [
          ["red", 10],
          ["tan", 10],
        ],
        angle,
      ),
    ).toEqual({
      backgroundImage: `linear-gradient(${angle}deg, red 10px, tan 10px, tan 20px, red 20px, red 30px, tan 30px)`,
      backgroundPosition: "top 0px left 0px",
      backgroundSize: expSize,
    });
  });

  test("complex pattern", () => {
    expect(
      stripedBackground(
        [
          ["red", 2],
          ["yellow", 4],
          ["green", 8],
          ["blue", 16],
        ],
        0,
      ),
    ).toEqual({
      backgroundImage: `linear-gradient(0deg, red 2px, yellow 2px, yellow 6px, green 6px, green 14px, blue 14px, blue 30px, red 30px, red 32px, yellow 32px, yellow 36px, green 36px, green 44px, blue 44px)`,
      backgroundPosition: "top 0px left 0px",
      backgroundSize: "1px 30px",
    });
  });

  test.each([
    { offset: 0, expPosition: "top 0px left 0px" },
    { offset: 15, expPosition: "top -10.6066px left 10.6066px" },
    { offset: 20, expPosition: "top 0px left 0px" },
    { offset: 25, expPosition: "top -3.53553px left 3.53553px" },
  ])("offset", ({ offset, expPosition }) => {
    expect(
      stripedBackground(
        [
          ["red", 4],
          ["tan", 16],
        ],
        45,
        offset,
      ),
    ).toEqual({
      backgroundImage: `linear-gradient(45deg, red 4px, tan 4px, tan 20px, red 20px, red 24px, tan 24px)`,
      backgroundPosition: expPosition,
      backgroundSize: "28.2843px 28.2843px",
    });
  });

  test("precise angle", () => {
    expect(
      stripedBackground(
        [
          ["red", 4],
          ["tan", 16],
        ],
        "7.068583470577034rad", // 360 + 45 degrees
      ),
    ).toEqual({
      backgroundImage: `linear-gradient(0.7853981633974474rad, red 4px, tan 4px, tan 20px, red 20px, red 24px, tan 24px)`,
      backgroundPosition: "top 0px left 0px",
      backgroundSize: "28.2843px 28.2843px",
    });
  });
});
