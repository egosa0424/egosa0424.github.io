// Difficulty Table
let mark = "";
let data_link = "";
$(function () {
  async function getJSON() {
    const response = await fetch(
      document.querySelector("meta[name=bmstable]").getAttribute("content")
    );
    const header = await response.json();
    document.getElementById("changelog").value = "Loading...";
    if (header.symbol) mark = header.symbol;
    if (header.data_url) data_link = header.data_url;
    if (header.level_order) {
      const enumOrder = header.level_order.map((e) => mark + e);
      DataTable.enum(enumOrder);
    }
    viewChangelog();
    makeBMSTable();
  }
  if (document.querySelector("meta[name=bmstable]")) getJSON();
});

// Changelog
function viewChangelog() {
  const $changelog = document.getElementById("changelog");
  const $show_log = document.getElementById("show_log");
  let isLogView = false;
  $show_log.addEventListener("click", () => {
    isLogView = !isLogView;
    if (isLogView === true) {
      $changelog.style.display = "block";
      $show_log.innerText = "Hide Changelog";
    } else {
      $changelog.style.display = "none";
      $show_log.innerText = "View Changelog";
    }
  });
}

// BMS table
function makeBMSTable() {
  let table = new DataTable("#table_int", {
    paging: false,
    info: false,
    lengthChange: false,

    ajax: {
      url: data_link,
      dataSrc: "",
    },

    columns:
      typeof tableColumns === "undefined" ? defaultColumns : tableColumns,

    createdRow: function (row, data) {
      const rowColor = {
        1: "table-primary",
        2: "table-warning",
        3: "table-success",
        4: "table-secondary",
        5: "table-info",
      };
      if (data.state) row.classList.add(rowColor[data.state]);
    },

    initComplete: function () {
      // Make Changelog
      makeChangelog(table);
      // Filter
      makeFilter(table);
    },
  });
}

// Changelog
function makeChangelog(table) {
  const data = table.ajax.json();
  // Special Date
  const siteOpen = {
    date: "Wed Apr 03 2019 00:00:00 GMT+0900 (JST)",
    title: "Sabun Site Open.",
    state: "special",
  };
  data.push(siteOpen);
  data.sort(function (a, b) {
    const aDate = new Date(a.date);
    const bDate = new Date(b.date);
    return aDate < bDate ? 1 : aDate > bDate ? -1 : 0;
  });
  const changelogData = data
    .map(function (song) {
      const dateStr = formatDateString(song.date);
      if (song.state == "special") {
        return `(${dateStr}) ${song.title}`;
      } else {
        return `(${dateStr}) ${mark}${song.level} ${song.title} Added.`;
      }
    })
    .join("\n");
  document.getElementById("changelog").value = changelogData;
  const lastUpdateTableDate = data.slice(0, 1).map(function (diffTable) {
    return formatDateString(diffTable.date);
  });
  document.getElementById("update").innerText =
    "Last Update : " + lastUpdateTableDate;
}

// Column Filter
function makeFilter(table) {
  const column = table.column(0);
  const filterText = "Filter by Level: ";
  const selectContainer = document.createElement("div");
  selectContainer.classList.add("dt-length");

  const select = document.createElement("select");
  select.classList.add("form-select", "form-select-sm");
  select.add(new Option("All", ""));

  select.addEventListener("change", function () {
    const val = DataTable.util.escapeRegex(this.value);
    column.search(val ? "^" + val + "$" : "", true, false).draw();
  });

  selectContainer.appendChild(document.createTextNode(filterText));
  selectContainer.appendChild(select);

  document
    .querySelector("#table_int_wrapper > div:nth-child(1) > .me-auto")
    .prepend(selectContainer);

  column
    .data()
    .unique()
    .sort(function (a, b) {
      return parseInt(a) - parseInt(b);
    })
    .each(function (d, j) {
      const option = document.createElement("option");
      option.value = mark + d;
      option.textContent = d;
      select.appendChild(option);
    });
}

// Date Format
function formatDateString(dateStr) {
  const date_ = new Date(dateStr);
  const year = date_.getFullYear();
  const month = String(date_.getMonth() + 1).padStart(2, "0");
  const day = String(date_.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

const tableData = {
  tableLevel: function (data) {
    return `${mark}${data}`;
  },

  tableTitle: function (data, type, row) {
    const lr2irBaseURL = `http://www.dream-pro.info/~lavalse/LR2IR/search.cgi?mode=ranking&bmsmd5=${row.md5}`;
    return `<a href="${lr2irBaseURL}" target="_blank">${data}</a>`;
  },

  tableScore: function (data) {
    const scoreBaseURL = `https://ez2pattern.kro.kr/bms/chart?md5=${data}`;
    return `<a href="${scoreBaseURL}" target="_blank"><i class="fas fa-lg fa-music"></i></a>`;
  },

  tableMovie: function (data) {
    const movieURL = `https://www.youtube.com/watch?v=${data.slice(-11)}`;
    if (data) {
      return `<a href="${movieURL}" target="_blank"><i class="fas fa-lg fa-play"></i></a>`;
    } else {
      return "";
    }
  },

  tableArtist: function (data, type, row) {
    let artistStr = "";
    if (row.url) {
      artistStr = `<a href='${row.url}' target='_blank'>${data || row.url}</a>`;
    }
    if (row.url_pack) {
      if (row.name_pack) {
        artistStr += `<br />(<a href='${row.url_pack}' target='_blank'>${row.name_pack}</a>)`;
      } else {
        artistStr += `<br />(<a href='${row.url_pack}' target='_blank'>${row.url_pack}</a>)`;
      }
    } else if (row.name_pack) {
      artistStr += `<br />(${row.name_pack})`;
    }
    return artistStr;
  },

  tableChart: function (data, type, row) {
    if (row.url_diff) {
      if (data) {
        return `<a href='${row.url_diff}' target='_blank'>${data}</a>`;
      } else {
        return `<a href='${row.url_diff}'><i class='fa-solid fa-arrow-down fa-lg'></i></a>`;
      }
    } else {
      if (data) {
        return data;
      } else {
        return "同梱";
      }
    }
  },

  tableDate: function (data) {
    if (data) {
      return formatDateString(data);
    } else {
      return "";
    }
  },

  tableComment: function (data, type, row) {
    return row.comment || "";
  },
};

const defaultColumns = [
  {
    title: "Level",
    width: "1%",
    data: "level",
    render: tableData.tableLevel,
  },
  {
    title: "<i class='fas fa-lg fa-music'></i>",
    width: "1%",
    data: "md5",
    orderable: false,
    searchable: false,
    render: tableData.tableScore,
  },
  {
    title: "<i class='fas fa-lg fa-play'></i>",
    width: "1%",
    data: "movie_link",
    orderable: false,
    searchable: false,
    render: tableData.tableMovie,
  },
  {
    title: "Title<br>(LR2IR)",
    width: "30%",
    data: "title",
    render: tableData.tableTitle,
  },
  {
    title: "Artist<br>(BMS DL)",
    width: "30%",
    data: "artist",
    render: tableData.tableArtist,
  },
  {
    title: "DL",
    width: "1%",
    data: "name_diff",
    className: "text-nowrap",
    orderable: false,
    render: tableData.tableChart,
  },
  {
    title: "Date",
    width: "5%",
    data: "date",
    render: tableData.tableDate,
  },
  {
    title: "Comment",
    width: "35%",
    render: tableData.tableComment,
  },
];
