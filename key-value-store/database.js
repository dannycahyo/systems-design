const mockDB = {
  ["index.html"]: "<html>Hello World</html>",
};

module.exports.get = (key, callback) => {
  setTimeout(() => {
    callback(mockDB[key]);
  }, 3000);
};
