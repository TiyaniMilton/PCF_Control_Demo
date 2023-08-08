import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class RSAIdNumberValidator implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    private _labelElement: HTMLLabelElement;
    private _container: HTMLDivElement;
    private _breakElement: HTMLBRElement;
    private _context: ComponentFramework.Context<IInputs>;
    private _notifyOutputChanged: () => void;

    private _textElement: HTMLInputElement;
    private _textElementChanged: EventListenerOrEventListenerObject;
    private _textElementKeyDown: EventListenerOrEventListenerObject;

    private _value: string;

    /**
     * Empty constructor.
     */
    constructor() {

    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
        // Add control initialization code
        this._context = context;
        this._container = container;
        this._notifyOutputChanged = notifyOutputChanged;
        this._textElementChanged = this.IdNumberChanged.bind(this);
        this._textElementKeyDown = this.IdNumberKeyDown.bind(this);

        this._value = "";

        if (context.parameters.IdNumberProperty == null) {
            this._value = "";
        }
        else {
            this._value = context.parameters.IdNumberProperty.raw == null ? "" : context.parameters.IdNumberProperty.raw;
        }

        this._textElement = document.createElement("input");
        this._textElement.setAttribute("type", "text");
        this._textElement.addEventListener("change", this._textElementChanged);
        this._textElement.addEventListener("onKeyDown", this._textElementKeyDown);
        this._textElement.setAttribute("value", this._value);
        this._textElement.setAttribute("class", "InputText");
        this._textElement.value = this._value;

        this._textElement.addEventListener("focusin", () => {
            this._textElement.className = "InputTextFocused";
        });
        this._textElement.addEventListener("focusout", () => {
            this._textElement.className = "InputText";
        });

        this._breakElement = document.createElement("br");

        this._labelElement = document.createElement("label");
        this._labelElement.setAttribute("border", "2");

        this.ValidateSouthAfricanIdNumber();

        this._container.appendChild(this._textElement);
        this._container.appendChild(this._breakElement);
        this._container.appendChild(this._labelElement);
    }


    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        // Add code to update control view
        let readOnly = this._context.mode.isControlDisabled;
        let masked = false;

        if (this._context.parameters.IdNumberProperty.security) {
            readOnly = readOnly || !this._context.parameters.IdNumberProperty.security.editable;
            masked = !this._context.parameters.IdNumberProperty.security.readable;
        }
        if (masked)
            this._textElement.setAttribute("placeholder", "*******");
        else
            this._textElement.setAttribute("placeholder", "Type-in a valid South African Id Number...");
        if (readOnly)
            this._textElement.readOnly = true;
        else
            this._textElement.readOnly = false;
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs {
        return {
            IdNumberProperty: this._value
        };
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        // Add code to cleanup control if necessary
        this._textElement.removeEventListener("change", this._textElementChanged);
        this._textElement.removeEventListener("keydown", this._textElementKeyDown);

    }

    public IdNumberChanged(evt: Event): void {
        this._value = this._textElement.value;
        this.ValidateSouthAfricanIdNumber();

        this._notifyOutputChanged();
    }

    public IdNumberKeyDown(evt: KeyboardEvent): void {
        this._value = this._textElement.value;
        this.ValidateSouthAfricanIdNumber();

        this._notifyOutputChanged();
    }

    public isNumber(n: any): boolean {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    private isDateYYMMDD(dateString: string): boolean {
        // console.log("isDateYYMMDD", dateString);
        // dateString must be valid date in format YYMMDD
        const re = /^[0-9]{6}$/;
        if (!re.test(String(dateString).toLowerCase())) {
            console.log("isDateYYMMDD, length or cahracters incorrect", dateString);
            return false;
        }
        let year = dateString.substring(0, 2);
        let month = dateString.substring(2, 4);
        let day = dateString.substring(4, 6);
        // console.log("year", year);
        // console.log("month", month);
        // console.log("day", day);
        //TODO: improve year calculation based on current year and viable cutoff points to make year 20XX or 19XX. However: it does work for this case either way
        if (year < "20") {
            year = "20" + year;
        } else {
            year = "19" + year;
        }
        // console.log("year", year);
        if (month < "01" || month > "12") {
            // console.log("month", month);
            return false;
        }
        if (day < "01" || day > "31") {
            // console.log("day", day);
            return false;
        }
        let date = new Date(year + "-" + month + "-" + day);
        // console.log("date", date);
        if (date.getFullYear() === Number(year) && date.getMonth() === Number(month) - 1 && date.getDate() === Number(day)) {
            return true;
        }
        return false;
    }

    private ValidateSouthAfricanIdNumber(): void {

        this._labelElement.innerText = "loading..";

        var data = null;
        var result = null;
        var _this = this;

        const idNumber = this._textElement.value;

        if (!this.isNumber(idNumber)) {
            _this._labelElement.innerText = 'Error occured Validating Id Number - not a number. Please try again!';
            _this._labelElement.style.color = "black";
            _this._labelElement.style.backgroundColor = "#Ff0000";
            return;
        }
        const re = /^[0-9]{13}$/;
        if (!re.test(String(idNumber).toLowerCase())) {
            _this._labelElement.innerText = "The Id Number doesn't meet the required charactor length - invalid !";
            _this._labelElement.style.color = "white";
            _this._labelElement.style.backgroundColor = "#Ff0000";
            return;
        }

        // first 6 characters must be valid date in format YYMMDD

        if (!this.isDateYYMMDD(idNumber.substring(0, 6))) {
            _this._labelElement.innerText = "The Id Number first 6 characters must be valid date in format YYMMDD - invalid !";
            _this._labelElement.style.color = "white";
            _this._labelElement.style.backgroundColor = "#Ff0000";
            return;
        }

        //if value is not 0 or 1
        let citizen = idNumber.substring(10, 11);

        if (parseInt(citizen) > 1) {
            // console.log("citizen error: must be 0 or 1 found -", citizen);
            _this._labelElement.innerText = `citizen error: must be 0 or 1 found ({citizen}) - invalid !`;
            _this._labelElement.style.color = "white";
            _this._labelElement.style.backgroundColor = "#Ff0000";
            return;
        }

        // Start Luhn Algorithm checksum

        // last character
        let Z = parseInt(idNumber.substring(12, 13));
        // console.log("last char",Z);
        let validateZ = idNumber.substring(0, 12);
        // console.log("validateZ", validateZ);

        // add odd digits of validateZ together
        let oddSum = 0;
        for (let i = 0; i < validateZ.length; i += 2) {
            oddSum += Number(validateZ.charAt(i));
        }
        // console.log( "oddSum", oddSum);

        ///create a number from even digits and double it
        let evenNumber = "";
        for (let i = 1; i < validateZ.length; i += 2) {
            evenNumber += validateZ.charAt(i);
        }
        //console.log("evenNumber", evenNumber);
        evenNumber = (parseInt(evenNumber) * 2).toString();
        // console.log("evenNumber*2", evenNumber);
        //turn int even number into string
        evenNumber = evenNumber.toString();

        //add digits of even number together
        let evenSum = 0;
        for (let i = 0; i < evenNumber.length; i++) {
            evenSum += Number(evenNumber.charAt(i));
        }

        let total = oddSum + evenSum;
        // console.log("total", total);
        //get last digit of total
        let lastDigit = total % 10;
        //console.log("lastDigit", lastDigit);
        // if last digit is 0 then last digit is 10
        if (Z !== 0) {
            lastDigit = 10 - lastDigit;
        }

        if (lastDigit !== Number(Z)) {
            // console.log("checksum failed");
            // console.log("lastDigit", lastDigit);
            // console.log("z", Z);
            _this._labelElement.innerText = 'Error occured Validating Id Number. Please try again!';
            _this._labelElement.style.color = "black";
            _this._labelElement.style.backgroundColor = "#Ff0000";
            return;
        }
        _this._labelElement.innerText = "The Id Number is valid !"
        _this._labelElement.style.color = "white";
        _this._labelElement.style.backgroundColor = "#4CAF50";
    }
}

