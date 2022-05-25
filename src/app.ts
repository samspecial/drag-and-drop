// Code goes here!

//interface
interface Validatable{
    value: string|number;
    require: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

//autobind decorator
function autobind(_: any, _1: string, descriptor: PropertyDescriptor){
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get(){
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    };
    return adjDescriptor;
}

class ProjectTemplate{
    templateField: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLFormElement;
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor(){
        this.templateField = document.getElementById("project-input")! as HTMLTemplateElement;
        this.hostElement = document.getElementById("app")! as HTMLDivElement;
        const importedNode = document.importNode(this.templateField.content, true);
        this.element = importedNode.firstElementChild as HTMLFormElement;
        this.titleInputElement = this.element.querySelector("#title") as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector("#description") as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector("#people") as HTMLInputElement;

        this.element.id = "user-input";
        this.configure();
        this.attach();
    }

    private gatherUserInput():[string, string, number]|void{
        const title = this.titleInputElement.value;
        const description = this.descriptionInputElement.value;
        const people = this.peopleInputElement.value;
        if(title.trim().length === 0 || description.trim().length === 0 || people.trim().length === 0){
            alert("Invalid input, please try again");
            return;
        }else{
            return [title, description, +people]
        }
    
    }

    private clearInputField():void{
        this.titleInputElement.value = "";
        this.descriptionInputElement.value = "";
        this.peopleInputElement.value = "";
    }
    @autobind
    private submitHandler(event: Event){
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if(Array.isArray(userInput)){
            const [title, description, people] = userInput;
            console.log(title, description, people);
        }
        this.clearInputField();
    }

    private configure(){
        this.element.addEventListener("submit", this.submitHandler);
    }

    private attach (){
        this.hostElement.insertAdjacentElement("afterbegin", this.element)
    }
}

const result = new ProjectTemplate();