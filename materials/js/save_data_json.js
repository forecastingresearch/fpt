export function save_data_json(session_id, data_checkpoint, data_checkpoint_ind, jsP_data, jsP_interaction_data=[]) {
    const data = {
        session_id: session_id,
        data_checkpoint: data_checkpoint,
        data_checkpoint_ind: data_checkpoint_ind,
        data: jsP_data,
        interaction_data: jsP_interaction_data
    }
    console.log("Saving data json: ", data)
}

export function check_metadata(session_info) {
    // Helper functions that were on the server-side
    function shuffle(array) {
        // Shuffle from jsPsych
        if (!Array.isArray(array)) {
            console.error("Argument to shuffle() must be an array.");
            return;
        }
        const copy_array = array.slice(0);
        let m = copy_array.length, t, i;
        // While there remain elements to shuffle…
        while (m) {
            // Pick a remaining element…
            i = Math.floor(Math.random() * m--);
            // And swap it with the current element.
            t = copy_array[m];
            copy_array[m] = copy_array[i];
            copy_array[i] = t;
        }
        return copy_array;
    }

    function get_random_task_order(form) {
        const tasks_per_form = {
            form_223301: ["time_series", "leapfrog", "impossible_question", "denominator_neglect_version_A", "denominator_neglect_version_B", "bayesian_update_easy", "bayesian_update_hard", "shipley_vocab", "shipley_abstraction", "admc_rc1", "admc_a2", "admc_rp", "coherence_forecasting", "graph_literacy"],
            form_33ff78: ["time_series", "leapfrog", "impossible_question", "denominator_neglect_version_A", "denominator_neglect_version_B", "bayesian_update_easy", "bayesian_update_hard", "cognitive_reflection", "number_series", "raven_matrix", "admc_rc2", "admc_a1", "admc_dr"],
            form_all: ["leapfrog", "admc_rc1", "admc_a1", "admc_rc2", "admc_a2", "admc_dr", "admc_rp", "denominator_neglect_version_A", "denominator_neglect_version_B", "graph_literacy", "impossible_question", "time_series", "bayesian_update_easy", "bayesian_update_hard", "cognitive_reflection", "number_series", "coherence_forecasting", "raven_matrix", "conditional_forecasting", "shipley_vocab", "shipley_abstraction"]
        };

        const special_cases = ["denominator_neglect_version_B", "bayesian_update_hard"];
        let tasks = tasks_per_form[`form_${form}`];
        if (!tasks) {
            console.error("Invalid form provided.");
            return {};
        }
        let tasks_random_order = shuffle(tasks.filter(e => !special_cases.includes(e)));
        if (tasks_random_order.includes("denominator_neglect_version_A")) {
            tasks_random_order.splice(tasks_random_order.indexOf("denominator_neglect_version_A") + 1, 0, "denominator_neglect_version_B");
        }
        if (tasks_random_order.includes("bayesian_update_easy")) {
            tasks_random_order.splice(tasks_random_order.indexOf("bayesian_update_easy") + 1, 0, "bayesian_update_hard");
        }
        tasks_random_order = tasks_random_order.reduce((acc, item, index) => {
            acc[item] = index + 1;
            return acc;
        }, {});
        return tasks_random_order;
    }

    function create_session_id(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    }
    // this was used as a basis to recognize individual particiapnts
    // const data = {
    //     subject_id: session_info.subject_id,
    //     form: session_info.form,
    //     wave: session_info.wave
    // }


    // return a response w/ settings for a brand new session
    // some of these varied based on whether this was a fresh session or not
    // technically starting from a custom position is possible here by providing a list of data_checkpoints to skip (by their name) and setting the last_data_checkpoint_ind to the index of the last checkpoint
    // for example...
    let task_order_indices = get_random_task_order(session_info.form)
    return new Promise((resolve) => {
        const simulated_response = {
            status: 201,
            status_message: "New session created",
            session_id: create_session_id(26),
            session_restart_id: create_session_id(26),
            task_order_indices: task_order_indices,
            data_checkpoints: [],
            last_data_checkpoint_ind: 0
        };
        resolve(simulated_response);
    });
}

export function save_session_restart_info(session_info, browser_reject_info=null) {
    let data = {}
    if (browser_reject_info != null) {
        data = {
            session_id: session_info.session_id,
            session_restart_id: session_info.session_restart_id,
            data_checkpoint_ind: null,
            ms_since_data_checkpoint_ind: null,
            trials_completed_since_data_checkpoint_ind: null,
            browser_reject_info: browser_reject_info
        }
    } else {
        data = {
            session_id: session_info.session_id,
            session_restart_id: session_info.session_restart_id,
            data_checkpoint_ind: session_info.data_checkpoint_ind,
            ms_since_data_checkpoint_ind: session_info.ms_since_data_checkpoint_ind,
            trials_completed_since_data_checkpoint_ind: session_info.trials_completed_since_data_checkpoint_ind,
            browser_reject_info: null
        }
    }
    console.log("Saving session restart info: ", data)
}

export function save_data_backup(session_info, jsP_data) {
    console.log("Saving backup data in chunks")
    let chunk_size = Math.ceil(jsP_data.length / 20);
    let chunks = [];
    for (let i = 0; i < jsP_data.length; i += chunk_size) {
        chunks.push(jsP_data.slice(i, i + chunk_size));
    }

    let promises = chunks.map((chunk_data, chunk_id) => {
        const data = {
            session_id: session_info.session_id,
            data: chunk_data,
            chunk_id: chunk_id
        };
        console.log("Chunk ", chunk_id, "Data: ", data);

        // Simulating data saving process, taking taking 3 seconds
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({});
            }, 3000);
        });
    });

    return promises;
}