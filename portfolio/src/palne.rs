use leptos::prelude::*;

#[component]
fn Plane() -> impl IntoView {
    view! {
        <style>
            .box {
                min-height: 200px;
                padding: 10px;
                background-color: #303030;
                border-radius: 2px;
            }
        </style>

        <div class="box">
            <slot />
        </div>
    }
}
