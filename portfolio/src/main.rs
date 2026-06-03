use leptos::prelude::*;
use Plane::plane;

fn main() {
    mount_to_body(App);
}

#[component]
fn App() -> impl IntoView {
    view! {
        <main>
            <div class="container">
                <h1>"Hello, world!"</h1>
                Plane()
            </div>
        </main>
    }
}