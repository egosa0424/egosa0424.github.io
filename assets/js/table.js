// Difficulty Table
let mark = "",
  data_link = "";
$(function () {
  $.getJSON($("meta[name=bmstable]").attr("content"), function (header) {
    document.getElementById("changelog").value = "Loading...";
    mark = header.symbol;
    if (header.data_url) data_link = header.data_url;
    viewChangelog();
    makeBMSTable();
  });
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
  let bmsTable = new DataTable("#table_int", {
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
      if (data.state == 1) $(row).addClass("table-primary");
      if (data.state == 2) $(row).addClass("table-warning");
      if (data.state == 3) $(row).addClass("table-success");
      if (data.state == 4) $(row).addClass("table-secondary");
      if (data.state == 5) $(row).addClass("table-info");
    },

    initComplete: function () {
      // Make Changelog
      makeChangelog(bmsTable);
      // Filter
      makeFilter(bmsTable);
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
    .filter(function (song) {
      return !!song.date;
    })
    .map(function (song) {
      const date_ = new Date(song.date);
      const dateStr =
        date_.getFullYear() +
        "." +
        ("0" + (date_.getMonth() + 1)).slice(-2) +
        "." +
        ("0" + date_.getDate()).slice(-2);
      if (song.state == "special") {
        return "(" + dateStr + ")" + " " + song.title;
      } else {
        return (
          "(" +
          dateStr +
          ") " +
          mark +
          song.level +
          " " +
          song.title +
          " Added."
        );
      }
    })
    .join("\n");
  document.getElementById("changelog").value = changelogData;
  const lastUpdateTableDate = data.slice(0, 1).map(function (diffTable) {
    const date_ = new Date(diffTable.date);
    const dateStr =
      date_.getFullYear() +
      "." +
      ("0" + (date_.getMonth() + 1)).slice(-2) +
      "." +
      ("0" + date_.getDate()).slice(-2);
    return dateStr;
  });
  document.getElementById("update").innerText =
    "Last Update : " + lastUpdateTableDate;
}

// Column Filter
function makeFilter(table) {
  table.columns(0).every(function () {
    const column = this;
    let select = $(
      "<div class='float-start'>" +
        "Filter by Level: " +
        "<select class='fs-6'>" +
        "<option value=''>All</option>" +
        "</select>" +
        "</div>"
    )
      .prependTo($("#table_int_wrapper"))
      .on("change", function () {
        const val = $.fn.dataTable.util.escapeRegex(
          $(this).find("select").val()
        );
        column.search(val ? "^" + val + "$" : "", true, false).draw();
      });
    column
      .data()
      .unique()
      .sort(function (a, b) {
        return parseInt(a) - parseInt(b);
      })
      .each(function (d, j) {
        select
          .find("select")
          .append("<option value='" + mark + d + "'>" + d + "</option>");
      });
  });
}

const tableData = {
  tableLevel: function (data) {
    return mark + data;
  },

  tableTitle: function (data, type, row) {
    let lr2irBaseURL =
      "http://www.dream-pro.info/~lavalse/LR2IR/search.cgi?mode=ranking&bmsmd5=";
    lr2irBaseURL += row.md5;
    return "<a href='" + lr2irBaseURL + "' target='_blank'>" + data + "</a>";
  },

  tableScore: function (data) {
    let scoreBaseURL = "http://www.ribbit.xyz/bms/score/view?md5=";
    scoreBaseURL += data;
    return (
      "<a href='" +
      scoreBaseURL +
      "' target='_blank'><i class='fas fa-lg fa-music'></i></a>"
    );
  },

  tableMovie: function (data) {
    let movieURL = "https://www.youtube.com/watch?v=";
    movieURL += data.slice(-11);
    if (data) {
      return (
        "<a href='" +
        movieURL +
        "' target='_blank'>" +
        "<i class='fas fa-lg fa-play'></i>" +
        "</a>"
      );
    } else {
      return "";
    }
  },

  tableArtist: function (data, type, row) {
    let artistStr = "";
    if (row.url) {
      if (data) {
        artistStr =
          "<a href='" + row.url + "' target='_blank'>" + data + "</a>";
      } else {
        artistStr =
          "<a href='" + row.url + "' target='_blank'>" + row.url + "</a>";
      }
    } else {
      if (data) {
        artistStr = data;
      }
    }
    if (row.url_pack) {
      if (row.name_pack) {
        artistStr +=
          "<br>(<a href='" +
          row.url_pack +
          "' target='_blank'>" +
          row.name_pack +
          "</a>)";
      } else {
        artistStr +=
          "<br>(<a href='" +
          row.url_pack +
          "' target='_blank'>" +
          row.url_pack +
          "</a>)";
      }
    } else {
      if (row.name_pack) {
        artistStr += "<br>(" + row.name_pack + ")";
      }
    }
    return artistStr;
  },

  tableChart: function (data, type, row) {
    if (row.maker_site) {
      if (row.url_diff) {
        return (
          "<a href='" +
          row.url_diff +
          "'>" +
          "<i class='fas fa-lg fa-arrow-down'></i>" +
          "</a><br>(<a href='" +
          row.maker_site +
          "'>" +
          data +
          "</a>)"
        );
      } else {
        return "同梱<br>(<a href='" + row.maker_site + "'>" + data + "</a>)";
      }
    } else {
      if (row.url_diff) {
        if (data) {
          return (
            "<a href='" + row.url_diff + "' target='_blank'>" + data + "</a>"
          );
        } else {
          return (
            "<a href='" +
            row.url_diff +
            "'>" +
            "<i class='fas fa-lg fa-arrow-down'></i>" +
            "</a>"
          );
        }
      } else {
        if (data) {
          return data;
        } else {
          return "同梱";
        }
      }
    }
  },

  tableDate: function (data) {
    if (data) {
      const date_ = new Date(data);
      const dateString =
        date_.getFullYear() +
        "." +
        ("0" + (date_.getMonth() + 1)).slice(-2) +
        "." +
        ("0" + date_.getDate()).slice(-2);
      return dateString;
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
    type: "natural-nohtml",
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
