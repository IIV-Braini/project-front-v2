let currentPage = 0
let countUserInPage = 0
let optionsRaces = []
let optionsProfessions = []
let optionsBanned = createOptions(data = ["false", "true"])



$(document).ready(function () {
    $.get("/rest/players", function (data) {
        setRowsWithUsersInfo(data)
    })

    $.get("/rest/players/count", function (data) {
        setNaviButtons(data)
    })
    
    $.get("/rest/players/race", function (data) {
        setOptionsSelectMenu(createOptions(data), "race")
        optionsRaces = createOptions(data)
    })
    
    $.get("/rest/players/profession", function (data) {
        setOptionsSelectMenu(createOptions(data), "profession")
        optionsProfessions = createOptions(data)
    })
    setOptionsSelectMenu(optionsBanned, "banned")
})

$('#select_value').change(function () {
    currentPage = 0
    let countPerPage = $('#select_value').val()
    $.get("/rest/players?pageSize=" + countPerPage, function (data) {
        setRowsWithUsersInfo(data)
    })
    $.get("/rest/players/count", function (data) {
        setNaviButtons(data)
    })
})

$(document).on('click', 'input.navigations_buttons', function () {
    currentPage = this.value - 1
    let countPerPage = $('#select_value').val()
    $.get("/rest/players?pageNumber=" + currentPage + "&pageSize=" + countPerPage, function (data) {
        setRowsWithUsersInfo(data)
    })

    $.get("/rest/players/count", function (data) {
        setNaviButtons(data)
    })
})

$(document).on('click', '#save_new_user', function () {
    let userData = getDataForCreateNewUser()
    if (userDataCheck(userData, true)) {
        $.ajax({
            type: "POST",
            url: "/rest/players/",
            headers: {
                "Content-Type": "application/json"
            },
            data: JSON.stringify(userData),
            complete: function (xhr) {
                if (xhr.status === 200) {
                    let countPerPage = $('#select_value').val()
                    $.get("/rest/players?pageNumber=" + currentPage + "&pageSize=" + countPerPage, function (data) {
                        setRowsWithUsersInfo(data)
                    })

                    $.get("/rest/players/count", function (data) {
                        setNaviButtons(data)
                    })
                }
            }
        })
    }
})

$(document).on('click', 'img.delete', function () {
    let id = this.getAttribute("value")
    $.ajax({
        url: "/rest/players/" + id,
        type: 'DELETE',
        complete: function (xhr) {
            if (xhr.status === 200) {
                if (countUserInPage === 1) {
                    currentPage = currentPage - 1
                    let countPerPage = $('#select_value').val()
                    $.get("/rest/players?pageNumber=" + currentPage + "&pageSize=" + countPerPage, function (data) {
                        setRowsWithUsersInfo(data)
                    })
                } else {
                    $('#row_' + id).remove()
                    countUserInPage -= 1
                }
                $.get("/rest/players/count", function (data) {
                    setNaviButtons(data)
                })
            }
        }
    })
})

$(document).on('click', 'img.save', function () {
    let id = this.getAttribute("value")
    let changeUser = getDataForUpdateNewUser(id)
    if (userDataCheck(changeUser, false)) {
        this.src = "../img/edit.png"
        this.setAttribute("class", "edit")
        $.ajax({
            type: "POST",
            url: "/rest/players/" + id,
            headers: {
                "Content-Type": "application/json"
            },
            data: JSON.stringify(changeUser),
            complete: function (xhr) {
                if (xhr.status === 200) {
                    $('#name_' + id).html("").html(changeUser.name)
                    $('#title_' + id).html("").html(changeUser.title)
                    $('#race_' + id).html("").html(changeUser.race)
                    $('#profession_' + id).html("").html(changeUser.profession)
                    $('#banned_' + id).html("").html(changeUser.banned)
                }
            }
        })
        $('#delete_' + id).removeClass('undelete').addClass('delete')
    }
})

$(document).on('click', 'img.edit', function () {
    this.src = "../img/save.png"
    this.setAttribute("class", "save")
    let id = this.getAttribute("value")
    createInputText(id, "name")
    createInputText(id, "title")
    createSelect(id, "race", optionsRaces)
    createSelect(id, "profession", optionsProfessions)
    createSelect(id, "banned", optionsBanned)
    $('#delete_' + id).removeClass('delete').addClass('undelete')
})

function createInputText(id, attribute) {
    let $currentObject = $('#' + attribute + '_' + id)
    let input = document.createElement("input")
    input.setAttribute("type", "text")
    input.setAttribute("value", $currentObject.text())
    input.setAttribute("id", "input_" + attribute + "_" + id)
    $currentObject.html("").html(input)
}

function createSelect (id, attribute, options) {
    let $currentObject = $('#' + attribute + '_' + id)
    let select = document.createElement("select")
    for (let i = 0; i < options.length; i++) {
        select.appendChild(options[i].cloneNode(true))
    }
    select.value = $currentObject.text()
    select.setAttribute("id", "select_" + attribute + "_" + id)
    $currentObject.html("").html(select)
}

function setOptionsSelectMenu(options, attribute) {
    $('#user_' + attribute).html(options)
}


function createOptions(data) {
    let options = []
    for (let i = 0; i < data.length; i++) {
        let optionElement = document.createElement("option")
        optionElement.setAttribute("value", data[i])
        optionElement.innerText = data[i]
        options[i] = optionElement
    }
    return options
}


function setRowsWithUsersInfo(users) {
    countUserInPage = users.length
    $('#tbody_table').html('').html(createRows(users))
}

function createRows(users) {
    let rows = []
    for (let i = 0; i < users.length; i++) {
        rows[i] = createRow(users[i])
    }
    return rows
}

function createRow(userInfo) {
    let id = userInfo.id
    let row = document.createElement('tr')
    row.id = "row_" + id
    createTd(row, id, id, "id")
    createTd(row, userInfo.name, id, "name")
    createTd(row, userInfo.title, id, "title")
    createTd(row, userInfo.race, id, "race")
    createTd(row, userInfo.profession, id, "profession")
    createTd(row, userInfo.level, id, "level")
    createTd(row, new Date(userInfo.birthday)
        .toLocaleDateString("en-US",
            {day: 'numeric', month: 'numeric', year: 'numeric'}), id, "date")
    createTd(row, userInfo.banned, id, "banned")
    createTdWithImage(row, "../img/edit.png", id, "edit")
    createTdWithImage(row, "../img/delete.png", id, "delete")
    return row
}

function createTd(row, innerText, id, attribute) {
    let td = document.createElement('td')
    td.innerText = innerText
    td.setAttribute("id", attribute + "_" + id)
    row.appendChild(td)
}

function createTdWithImage(row, path, id, attribute) {
    let tdWithImage = document.createElement('td')
    let image = document.createElement('img')
    image.src = path
    image.setAttribute("class", attribute)
    image.setAttribute("value", id)
    image.setAttribute("id", attribute + "_" + id)
    tdWithImage.appendChild(image)
    row.appendChild(tdWithImage)
}

function setNaviButtons(usersCount) {
    $('#navi_buttons').html("").html(createNaviButtons(usersCount))
    setOnNavigationButton(currentPage + 1)
}

function setOnNavigationButton(number) {
    let $button = $('#navigations_button_' + number)
    $button.removeClass("navigations_buttons").addClass("on_navigations_buttons")
}

function createNaviButtons(usersCount) {
    let buttons = []
    let countPerPage = $('#select_value').val()
    const count = usersCount / countPerPage
    for (let i = 0; i < count; i++) {
        let number = i + 1
        buttons[i] = createNaviButton(number)
    }
    return buttons
}

function createNaviButton(number) {
    let button = document.createElement('input')
    button.type = "button"
    button.value = number
    button.setAttribute("class", "navigations_buttons")
    button.setAttribute("id", "navigations_button_" + number)
    return button
}

function getDataForCreateNewUser() {
    return {
        name: $('#user_name').val(),
        title: $('#user_title').val(),
        race: $('#user_race').val(),
        profession: $('#user_profession').val(),
        level: $('#user_level').val(),
        birthday: new Date($('#user_birthday').val()) * 1,
        banned: $('#user_banned').val(),
    }
}

function getDataForUpdateNewUser(id) {
    return {
        name: $('#input_name_' + id).val(),
        title: $('#input_title_' + id).val(),
        race: $('#select_race_' + id).val(),
        profession: $('#select_profession_' + id).val(),
        banned: $('#select_banned_' + id).val(),
    }
}

function userDataCheck(data, isNewUser) {
    let message = ""
    let check = true
    if (data.name.length > 12) {
        check = false
        message += "ERROR: Long name\n"
    }
    if (data.name.length === 0) {
        check = false
        message += "ERROR: Empty name\n"
    }
    if (data.title.length > 30) {
        check = false
        message += "ERROR: Long title\n"
    }
    if (isNewUser) {
        if (data.level > 100 || data.level < 0 || data.level === "") {
            check = false
            message += "ERROR: Wrong level\n"
        }
        if (new Date() * 1 - data.birthday <= 0 || isNaN(data.birthday)) {
            check = false
            message += "ERROR: Wrong birthday\n"
        }
    }
    if (!check) alert(message)
    return check
}




