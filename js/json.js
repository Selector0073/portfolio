class MyComponent extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });

        shadow.innerHTML = `
            <style>
                .card {
                    width: 190px;
                    height: 254px;
                    margin: 0 auto;
                    background-color: #011522;
                    border-radius: 8px;
                    z-index: 1;
                    font-family: sans-serif; /* Додано для коректного відображення тексту */
                }

                .tools {
                    display: flex;
                    align-items: center;
                    padding: 9px;
                }

                .circle {
                    padding: 0 4px;
                }

                .box {
                    display: inline-block;
                    align-items: center;
                    width: 10px;
                    height: 10px;
                    padding: 1px;
                    border-radius: 50%;
                }

                .red { background-color: #ff605c; }
                .yellow { background-color: #ffbd44; }
                .green { background-color: #00ca4e; }

                /* Стилізація контейнера контенту та самого слота */
                .card__content {
                    padding: 15px;
                    color: #ffffff;
                }
            </style>
            <div class="card">
                <div class="tools">
                    <div class="circle"><span class="red box"></span></div>
                    <div class="circle"><span class="yellow box"></span></div>
                    <div class="circle"><span class="green box"></span></div>
                </div>
                <div class="card__content">
                    <slot></slot> 
                </div>
            </div>
        `;
    }
}

customElements.define('my-card', MyComponent);