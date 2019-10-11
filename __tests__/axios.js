const { axios } = require("../dist")

describe("axios", () => {
  it("should fail as expected", async () => {
    const step = {}
    await expect(axios(step, {})).rejects.toThrow(step.error) // no url
  })
})
