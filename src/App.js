import { useState, useEffect } from "react";
import dayjs from "dayjs";
import __utc__ from "dayjs/plugin/utc";
import __timezone__ from "dayjs/plugin/timezone";
import __localizedFormat__ from "dayjs/plugin/localizedFormat";
import __relativeTime__ from "dayjs/plugin/relativeTime";

dayjs.extend(__utc__);
dayjs.extend(__timezone__);
dayjs.extend(__localizedFormat__);
dayjs.extend(__relativeTime__);

function TimezoneSelect({ id, value, onChange }) {
  const timezones = Intl.supportedValuesOf("timeZone").map((tz) => [
    tz,
    tz.split("/")[1].replace(/_/g, " "),
  ]);
  timezones.sort((a, b) => a[1].localeCompare(b[1]));
  return (
    <select id={id} value={value} onChange={onChange}>
      {timezones.map((tz) => (
        <option key={tz[0]} value={tz[0]}>
          {tz[1]}
        </option>
      ))}
    </select>
  );
}

function App() {
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [remoteTimezone, setRemoteTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [input, setInput] = useState(
    decodeURI(window.location.hash.replace(/^#/, "")) || ""
  );
  const [error, setError] = useState("");
  const [datetime, setDatetime] = useState(null);
  const remoteDatetime = datetime && datetime.tz(remoteTimezone);
  const remoteDiff =
    datetime &&
    parseInt(remoteDatetime.format("Z")) - parseInt(datetime.format("Z"));

  useEffect(() => {
    if (input) {
      parse();
    }
  }, []);

  function onChangeInput(e) {
    setInput(e.target.value);
    setError("");
  }

  function onChangeTimezone(e) {
    setTimezone(e.target.value, parse);
  }

  function onEnter(e) {
    if (e.key === "Enter") {
      parse();
    }
  }

  function submit(e) {
    e.preventDefault();
    parse();
  }

  function parse() {
    setError("");
    setDatetime(null);

    let text = input.trim();
    if (!text) {
      text = dayjs().format("LLLL");
      onChangeInput({ target: { value: text } });
    }
    window.location.hash = text;
    try {
      let datetime = null;
      if (text.match(/^\d+(\.\d+)?$/)) {
        datetime = dayjs.unix(text);
      } else {
        datetime = dayjs(text).tz(timezone, true);
      }
      if (!datetime.isValid()) {
        return setError("Invalid date or time string.");
      } else {
        setDatetime(datetime);
      }
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="container">
      <div className="header">
        <a className="logo" href=".">
          timezone.wtf
        </a>
      </div>
      <div className="main">
        <h1>Date & Time Explorer</h1>
        <p>Enter a date or time string...</p>
        <form className="input-group" onSubmit={submit}>
          <input
            type="text"
            autoFocus={true}
            placeholder="Enter a date or time string..."
            value={input}
            onChange={onChangeInput}
            onKeyDown={onEnter}
          />
          <button type="submit" className="primary">
            Parse
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
      {datetime && (
        <div className="details">
          <div className="timezone">
            <h5>In Local Timezone</h5>
            <TimezoneSelect
              id="localtz"
              value={timezone}
              onChange={onChangeTimezone}
            />
          </div>
          <div>
            {datetime.format("LLLL")}{" "}
            <span className="relative-time">({datetime.fromNow()})</span>
          </div>

          <div className="timezone" style={{ marginTop: "1em" }}>
            <h5>In Remote Timezone</h5>
            <TimezoneSelect
              id="remotetz"
              value={remoteTimezone}
              onChange={(e) => setRemoteTimezone(e.target.value)}
            />
          </div>
          <div>
            {remoteDatetime.format("LLLL")}
            <span className="relative-time">
              {`(${Math.abs(remoteDiff)} hours ${
                remoteDiff > 0 ? "ahead" : "behind"
              })`}
            </span>
          </div>

          <h5>In ISO 8601 Format</h5>
          <div>{datetime.toISOString()}</div>

          {/* <h5>In UTC Format</h5>
          <div>{datetime.toString()}</div> */}

          <h5>In UNIX Format</h5>
          <div>{datetime.unix()}</div>

          <h5>Parsed in Local Time</h5>
          <div className="parts">
            <div>
              <h6>Year</h6>
              <div>{datetime.year()}</div>
            </div>
            <div>
              <h6>Month</h6>
              <div>
                {datetime.format("MMMM")} ({datetime.month() + 1})
              </div>
            </div>
            <div>
              <h6>Days</h6>
              <div>
                {datetime.format("ddd")} ({datetime.format("D")})
              </div>
            </div>
            <div>
              <h6>Hours</h6>
              <div>
                {datetime.format("hA")} ({datetime.format("HH")})
              </div>
            </div>
            <div>
              <h6>Minutes</h6>
              <div>{datetime.minute()}</div>
            </div>
            <div>
              <h6>Seconds</h6>
              <div>{datetime.second()}</div>
            </div>
            <div>
              <h6>Ms</h6>
              <div>{datetime.millisecond()}</div>
            </div>
            <div>
              <h6>GMT</h6>
              <div>{datetime.format("Z")}</div>
            </div>
          </div>
        </div>
      )}
      <div className="moreinfo">
        <h3>What is a Time Zone?</h3>
        <p>
          The primary purpose of time zones is to ensure that when it's noon
          (midday) in one location, it's roughly noon in neighboring regions as
          well. The Earth is divided into <b>24 time zones</b>, each
          approximately <b>15 degrees</b> of longitude wide.
        </p>
        <p>
          The <b>Prime Meridian</b> is the starting point for measuring
          longitude and serves as the reference point for time zones. It passes
          through Greenwich, London, and is assigned a time called{" "}
          <b>Greenwich Mean Time (GMT)</b> or Coordinated Universal Time{" "}
          <b>(UTC+0)</b>. UTC is now widely used as the global standard for
          timekeeping.
        </p>
      </div>
      <div className="footer">
        <h3>About this Page</h3>
        <p>
          Made with ❤️ by{" "}
          <b>
            <a href="https://twitter.com/naulpichols">@naulpichols</a>
          </b>{" "}
          who freely admits to not knowing much about time zones. DM for
          feedback or suggestions.
        </p>
      </div>
    </div>
  );
}

export default App;
