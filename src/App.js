import { useState, useEffect } from "react";
import dayjs from "dayjs";
import __utc__ from "dayjs/plugin/utc";
import __timezone__ from "dayjs/plugin/timezone";
import __localizedFormat__ from "dayjs/plugin/localizedFormat";

dayjs.extend(__utc__);
dayjs.extend(__timezone__);
dayjs.extend(__localizedFormat__);

function DateParts({ datetime }) {
  return (
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
        <h6>Offset</h6>
        <div>{datetime.format("Z")}</div>
      </div>
    </div>
  );
}

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
  const [input, setInput] = useState(dayjs().format("MMMM DD, YYYY HH:mm:ss"));
  const [error, setError] = useState("");
  const [datetime, setDatetime] = useState(null);

  useEffect(() => {
    try {
      window.location.hash = input;
      parse();
    } catch (e) {}
  }, []);

  function onChange(e) {
    window.location.hash = e.target.value;
    setInput(e.target.value);
    setError("");
  }

  function onChangeTimezone(e) {
    setTimezone(e.target.value);
    setError("");
    if (input) {
      parse();
    }
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
    if (!input) {
      return;
    }
    try {
      let datetime = null;
      if (input.match(/^\d+(\.\d+)?$/)) {
        datetime = dayjs.unix(input);
      } else {
        datetime = dayjs(input).tz(timezone, true);
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
    <div>
      <div className="header container">
        <a className="logo" href="#">
          timezone.wtf
        </a>
        <div className="timezone">
          <label htmlFor="localtz">Local TZ</label>
          <TimezoneSelect
            id="localtz"
            value={timezone}
            onChange={onChangeTimezone}
          />
        </div>
      </div>
      <div className="container">
        <div className="main">
          <h1>Date & Time Explorer</h1>
          <p>Enter a date or time string...</p>
          <form className="input-group" onSubmit={submit}>
            <input
              type="text"
              autoFocus={true}
              placeholder="Enter a date or time string..."
              value={input}
              onChange={onChange}
              onKeyDown={onEnter}
            />
            <button type="submit" className="primary">
              Parse
            </button>
          </form>
          {error && <p className="error">{error}</p>}
        </div>
        {datetime && (
          <div className="datetime">
            <h3>More about this Date Time</h3>
            <div className="details">
              <h5>In Local Time</h5>
              <DateParts datetime={datetime} />

              <h5>In UTC</h5>
              <DateParts datetime={datetime.utc()} />

              <div className="remotetz">
                <h5>In Remote Timezone</h5>
                <TimezoneSelect
                  id="remotetz"
                  value={remoteTimezone}
                  onChange={(e) => setRemoteTimezone(e.target.value)}
                />
              </div>
              <div>{datetime.tz(remoteTimezone).format("LLLL")}</div>

              <h5>In ISO 8601 Format</h5>
              <div>{datetime.toISOString()}</div>

              <h5>In UTC Format</h5>
              <div>{datetime.toString()}</div>

              <h5>In UNIX Format</h5>
              <div>{datetime.unix()}</div>
            </div>
          </div>
        )}
        <div className="moreinfo">
          <h3>What is a Time Zone?</h3>
          <p>
            The primary purpose of time zones is to ensure that when it's noon
            (midday) in one location, it's roughly noon in neighboring regions
            as well. The Earth is divided into <b>24 time zones</b>, each
            approximately <b>15 degrees</b> of longitude wide.
          </p>
          <p>
            The <b>Prime Meridian</b> is the starting point for measuring
            longitude and serves as the reference point for time zones. It
            passes through Greenwich, London, and is assigned a time called{" "}
            <b>Greenwich Mean Time (GMT)</b> or Coordinated Universal Time{" "}
            <b>(UTC+0)</b>. UTC is now widely used as the global standard for
            timekeeping.
          </p>
        </div>
      </div>
      <div className="footer container">
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
