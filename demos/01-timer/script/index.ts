const timeDom = {
  Day: document.querySelector("#day"),
  Hour: document.querySelector("#hour"),
  Minute: document.querySelector("#minute"),
  Second: document.querySelector("#second"),
};

const date = new Date(`1 Jan 2022`);

type Time = {
  Day: string | number;
  Hour: string | number;
  Minute: string | number;
  Second: string | number;
};

function render(time: Time) {
  Object.entries(time).forEach(([key, value]) => {
    (timeDom as any)[key].innerHTML = value;
  });
}

function formator(time: Time) {
  const formatedTime: Time = { ...time };

  Object.entries(time).forEach(([key, value]) => {
    if (value < 10) {
      (formatedTime as any)[key] = `0${value}`;
    }
  });

  return formatedTime;
}

function createTime() {
  const diff = (date.getTime() - Date.now()) / 1000;

  const Day = Math.floor(diff / (3600 * 24));
  const Hour = Math.floor((diff % (3600 * 24)) / 3600);
  const Minute = Math.floor((diff % 3600) / 60);
  const Second = Math.floor(diff % 60);

  render(
    formator({
      Day,
      Hour,
      Minute,
      Second,
    })
  );
}

setInterval(createTime, 1000);
