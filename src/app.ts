// Code goes here!

// Project Type
enum ProjectStatus {Active, Finished}
class Project {
    constructor(public id: string, public title: string, public description: string, public people: number, public status:ProjectStatus){}
}

type Listener<T> = (items: T[]) => void;
//State Management

class State<T>{
    protected listeners: Listener<T>[] = [];
    addListener(listenerFn: Listener<T>){
        this.listeners.push(listenerFn)
    }
}
class ProjectState extends State<Project>{
    private projects: Project[] = [];
    private static instance: ProjectState;
    constructor() {
        super();
    }

    static getInstance(){
        if(this.instance){
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
        
    }

    addProject(title: string, description: string, numOfPeople: number){
        const newProject = new Project(Math.random().toString(), title, description, numOfPeople, ProjectStatus.Active);
        
        this.projects.push(newProject);
        for (const listener of this.listeners) {
            listener(this.projects.slice())
        }
    }
}

const projectState = ProjectState.getInstance();

//interface
interface Validatable{
    value: string|number;
    required: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

function validate(validateInput: Validatable){
    let isValid = true;
    if(validateInput.required){
        isValid = isValid && validateInput.value.toString().trim().length !== 0;
    }
    if(validateInput.minLength != null && typeof validateInput.value === "string"){
        isValid = isValid && validateInput.value.length > validateInput.minLength;
    }
    if(validateInput.maxLength != null && typeof validateInput.value === "string"){
        isValid = isValid && validateInput.value.length < validateInput.maxLength;
    }
    return isValid;
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

// Component Base Class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;

    constructor(templateId: string, hostElementId: string, insertAtStart: boolean, newElementId?: string) {
        this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
        this.hostElement = document.getElementById(hostElementId)! as T;
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as U;
        if(newElementId){
            this.element.id = newElementId;
        }
        this.attach(insertAtStart);
    }

    private attach (insertAtBeginning:  boolean){
        this.hostElement.insertAdjacentElement(insertAtBeginning ? "afterbegin": "beforeend", this.element)
    }

    abstract configure?(): void;
    abstract renderContent(): void;
}

class ProjectList extends Component<HTMLDivElement, HTMLElement>{
    assignedProjects: Project[];

    constructor(private type: "active"|"finished"){
        super("project-list", "app", false, `${type}-projects`)       
        this.assignedProjects = [];
        this.configure();
        this.renderContent();
    }

    private renderProject() {
        const listItem = document.getElementById(`${this.type}-project-list`)! as HTMLUListElement;
        listItem.innerHTML = "";
        for(const projectItem of this.assignedProjects){
            const listIt = document.createElement("li");
            listIt.textContent = projectItem.title;
            listItem.appendChild(listIt)
        }
    }

    configure(){
        projectState.addListener((projects: Project[]) =>{
            const relevantProjects = projects.filter(project => {
                if(this.type === "active"){
                    return project.status === ProjectStatus.Active;
                }
                return project.status === ProjectStatus.Finished;
            })
            this.assignedProjects = relevantProjects;
            this.renderProject();
        })
    }

    renderContent(){
        const listId = `${this.type}-project-list`;
        this.element.querySelector("ul")!.id = listId;
        this.element.querySelector("h2")!.textContent = this.type.toUpperCase() + " PROJECTS";
    }
   
}

class ProjectTemplate extends Component<HTMLDivElement, HTMLFormElement>{
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor(){
        super("project-input", "app", true, "user-input");
        this.titleInputElement = this.element.querySelector("#title") as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector("#description") as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector("#people") as HTMLInputElement;
        this.configure();
        
    }

    private gatherUserInput():[string, string, number]|void{
        const title = this.titleInputElement.value;
        const description = this.descriptionInputElement.value;
        const people = this.peopleInputElement.value;

        const titleValidatable: Validatable = {
            required:true,
            value: title
        }

        const descriptionValidatable: Validatable = {
            required: true,
            minLength:5,
            value:description
        }

        const peopleValidatable: Validatable = {
            required:true,
            value:people,
            min:1,
            max:5
        }

        if(!validate(titleValidatable) || !validate(descriptionValidatable) || !validate(peopleValidatable)){
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
           projectState.addProject(title, description, people);
        }
        this.clearInputField();
    }

    configure(){
        this.element.addEventListener("submit", this.submitHandler);
    }

    renderContent(): void {
        
    }
}

const result = new ProjectTemplate();
const activeProject = new ProjectList("active");
const finishedProject = new ProjectList("finished");