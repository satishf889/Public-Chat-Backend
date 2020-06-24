async function abc() {
  var counter = 0;
  let timerId = await setTimeout(function () {
    // tumhara code yaha chalega
    console.log(counter);
    counter++;
    if (counter === 5) {
      console.log("time up");
      clearInterval(timerId);
      console.log("Sending response");
      return counter;
    }
  }, 1000);

  console.log("fsd" + counter);
}
const handler = async () => {
  var temp = await abc();
  //   console.log("Calling")
};

handler();
