export default function initialise_dev_settings(experiment, tasks) {
    // removeQueryParams()

    document.querySelector("#options_toggle").onclick = toggle_options_container;

    generate_tasks_options();
    generate_tasks_buttons();
    generate_experiment_options();

    document.querySelectorAll('.task').forEach(task => {
        task.onclick = event => {
            document.querySelectorAll('#tasks_options_container .active').forEach(el => el.classList.remove('active'));
            set_active(`#${event.currentTarget.id}`);
            set_active(`#${event.currentTarget.id}_options`);
            set_max_height();
        }
    });

    document.querySelector("#set_options").onclick = () => {
        const generate_query_string = (obj, prefix = "") => obj.modifiable_settings
            // only encode values different from the defaults \
            // or experiment form is set (for demo)
            .filter(mod_setting => {
                let current_value = get_input_value(document.querySelector(`#${prefix}${mod_setting.query_shortcode}`))
                let default_value = obj.default_settings[mod_setting.variable].toString() //get_input value always returns a string
                return current_value !== default_value || mod_setting.query_shortcode=="frm"
            })
            .map(mod_setting => `${mod_setting.query_shortcode},${get_input_value(document.querySelector(`#${prefix}${mod_setting.query_shortcode}`))}`)
            .join(",");
        
        let query_string = ""

        let experiment_query_string = generate_query_string(experiment, "experiment_")
        if (experiment_query_string) {query_string += `experiment=${experiment_query_string}`}

        for (const [task_name, task] of Object.entries(tasks)) {
            let task_query = generate_query_string(task, `${task_name}_`);
            if (task_query) {query_string += `&${task_name}=${task_query}`}
        }

        if (query_string) {
            if (query_string.slice(0, 1)=="&") {query_string = query_string.slice(1)}
            window.location.href = `${window.location.origin}${window.location.pathname}?${query_string}`;
        } else {
            window.location.href = `${window.location.origin}${window.location.pathname}`;
        }

        // let query_string = "experiment=" + generate_query_string(experiment, "experiment_");
        // for (const [task_name, task] of Object.entries(tasks)) {
        //     query_string += `&${task_name}=${generate_query_string(task, `${task_name}_`)}`;
        // }
        // window.location.href = `${window.location.origin}${window.location.pathname}?${query_string}`;
    }

    document.querySelector("#reset_to_default").onclick = () => {
	    window.location.href = window.location.origin + window.location.pathname;
    }

    document.querySelector("#experiment_options_button").onclick = () => {
        switch_active("#experiment_options_button", "#tasks_options_button");
        switch_active("#experiment_options_container", "#tasks_options_container");
        set_max_height();
    }

    document.querySelector("#tasks_options_button").onclick = () => {
        switch_active("#tasks_options_button", "#experiment_options_button");
        switch_active("#tasks_options_container", "#experiment_options_container");
        set_max_height();
    }



    function set_active(selector, active=true) {
        document.querySelector(selector).classList[active ? 'add' : 'remove']('active');
    }

    function switch_active(active, inactive) {
        set_active(active)
        set_active(inactive, false)
    }

    function set_max_height() {
        let el = document.querySelector("#options_container")
        el.style.maxHeight = `${el.scrollHeight}`
    }

    function toggle_options_container(event) {
        const options_container = document.getElementById("options_container");
        if (options_container.classList.contains("hidden")) {
            options_container.classList.remove("hidden");
            options_container.classList.add("expanded");
            set_max_height()
        } else {
            if (event.target.id != "options_toggle" && event.target.tagName!=="SPAN") {
                return
            }
            options_container.classList.add("hidden");
            options_container.classList.remove("expanded")
        }
    }

    function generate_tasks_buttons() {
        const tasks_buttons = document.getElementById("tasks_buttons");
        tasks_buttons.innerHTML = "";

        Object.keys(tasks).forEach((task_name) => {
            const task_button = document.createElement("div");
            task_button.id = task_name;
            task_button.classList.add("task")
            task_button.textContent = tasks[task_name].prettyname;
            tasks_buttons.appendChild(task_button);
        });
        let first_task = tasks_buttons.querySelector("div")
        first_task.classList.add("active")
        document.querySelector(`#${first_task.id}_options`).classList.add("active")
    }

    function generate_tasks_options() {
        const options_container = document.getElementById("tasks_options");
        Object.keys(tasks).forEach((task_name) => {
            let task = tasks[task_name]

            let task_options_container = document.createElement("div")
            task_options_container.id = `${task_name}_options`
            task_options_container.classList.add("task_options")
            options_container.appendChild(task_options_container)

            for (let modifiable_setting of task.modifiable_settings) {
                const optionWrapper = document.createElement("div");
                optionWrapper.className = "task_option_container";
                task_options_container.appendChild(optionWrapper);

                const label = document.createElement("label");
                label.textContent = `${modifiable_setting.prettyname}: `
                optionWrapper.appendChild(label);

                // keep this in case I want to add multiple options to be selected with a dropdown
                // in such case add input_options parameters to that modifiable setting
                if (modifiable_setting.input_type == "select") {
                    const select = document.createElement("select");
                    select.id = `${task_name}_${modifiable_setting.query_shortcode}`;

                    for (let input_opt of modifiable_setting.input_options) {
                        let opt = document.createElement("option")
                        opt.value = input_opt.value
                        opt.textContent = input_opt.label
                        select.appendChild(opt)
                    }
                    select.value = task.settings[modifiable_setting.variable].toString();
                    optionWrapper.appendChild(select);
                } else {
                    const input = document.createElement("input");
                    input.id = `${task_name}_${modifiable_setting.query_shortcode}`;
                    input.type = modifiable_setting.input_type
                    if (modifiable_setting.input_type == "checkbox") {
                        input.checked = task.settings[modifiable_setting.variable]
                    } else if (modifiable_setting.input_type == "number") {
                        input.value = task.settings[modifiable_setting.variable].toString()
                    }
                    optionWrapper.appendChild(input);
                }
            }
        });
    }

    function generate_experiment_options() {
        const experiment_options_container = document.getElementById("experiment_options_container");
        for (let modifiable_setting of experiment.modifiable_settings) {
            const optionWrapper = document.createElement("div");
            optionWrapper.className = "task_option_container";
            experiment_options_container.appendChild(optionWrapper);

            const label = document.createElement("label");
            label.textContent = `${modifiable_setting.prettyname}: `
            optionWrapper.appendChild(label);

            if (modifiable_setting.input_type == "select") {
                const select = document.createElement("select");
                select.id = `experiment_${modifiable_setting.query_shortcode}`;

                for (let input_opt of modifiable_setting.input_options) {
                    let opt = document.createElement("option")
                    opt.value = input_opt.value
                    opt.textContent = input_opt.label
                    select.appendChild(opt)
                }
                select.value = experiment.settings[modifiable_setting.variable].toString();
                optionWrapper.appendChild(select);
            } else {
                const input = document.createElement("input");
                input.id = `experiment_${modifiable_setting.query_shortcode}`;
                input.type = modifiable_setting.input_type;
                if (modifiable_setting.input_type == "checkbox") {
                    input.checked = experiment.settings[modifiable_setting.variable]
                } else if (modifiable_setting.input_type == "number") {
                    input.value = experiment.settings[modifiable_setting.variable].toString()
                }
                optionWrapper.appendChild(input);
            }
        }
    }

    function get_input_value(input_element) {
        if (input_element.type=="checkbox") {
            return input_element.checked.toString()
        } else if (input_element.type=="number") {
            return input_element.value.toString()
        } else if (input_element.tagName=="SELECT") {
            return input_element.value.toString()
        }
    }   

    function removeQueryParams() {
        const currentUrl = new URL(window.location.href);
        const newUrl = new URL(currentUrl.origin + currentUrl.pathname);
        const form_param = currentUrl.searchParams.get('f');
    
        if (form_param !== null) {
            newUrl.searchParams.set('f', form_param);
        }
        window.history.pushState(null, null, newUrl);
    }
}