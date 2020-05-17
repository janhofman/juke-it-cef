import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { Step, Stepper, StepLabel } from 'material-ui/Stepper';
import { deepOrange500, fullWhite } from 'material-ui/styles/colors';
import FlatButton from 'material-ui/FlatButton';
import TimePicker from 'material-ui/TimePicker';
import NextArrow from 'material-ui/svg-icons/navigation/arrow-forward';
import PreviousArrow from 'material-ui/svg-icons/navigation/arrow-back';
import FinishIcon from 'material-ui/svg-icons/navigation/check';
import CancelIcon from 'material-ui/svg-icons/navigation/cancel';
import Star from 'material-ui/svg-icons/toggle/star';
import ExpandTransition from 'material-ui/internal/ExpandTransition';

import ScrollPane from '../../containers/ScrollPane';
import StyledTextField from '../StyledTextField';
import messages from './messages';


const styles = {
  base: {
    padding: '20px',
  },
  header: {
    fontSize: '1.5em',
    color: deepOrange500,
  },
  text: {
    color: fullWhite,
  },
  buttons: {
    marginTop: '1em',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ghost: {
    flex: '1 1 auto',
  },
  splitDiv: {
    width: '50%',
  },
  expansion: {
    overflow: 'hidden',
  },
  textfield: {
    marginLeft: '30px',
    maxWidth: '350px',
  },
  descriptionTextField: {
    marginLeft: '30px',
    maxWidth: '95%',
  },
  timePickerTextField: {
    width: '3em',
  },
  timePickerBase: {
    display: 'inline-block',
  },
  textGap: {
    display: 'inline-block',
    width: '1em',
  },
};

class SpotRegister extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stepIndex: 0,
      nameOpened: false,
      addressOpened: false,
      descriptionOpened: false,
      accInfoOpened: false,
      pricingOptionsOpened: false,
      openingHoursOpened: false,
      spotName: '',
      street: '',
      city: '',
      description: '',
      iban: '',
      bic: '',
      addToQue: null,
      openingHours: {
        monday: { from: null, to: null },
        tuesday: { from: null, to: null },
        wednesday: { from: null, to: null },
        thursday: { from: null, to: null },
        friday: { from: null, to: null },
        saturday: { from: null, to: null },
        sunday: { from: null, to: null },
      },
    };
  }
  // Introduction

  getIntroduction() {
    const { formatMessage } = this.props.intl;
    return (
      <div>
        <span style={styles.header}>{formatMessage(messages.introHeader)}</span>
        <p style={styles.text}>{formatMessage(messages.introPar1)}</p>
        <p style={styles.text}>{formatMessage(messages.introPar3)}</p>
      </div>

    );
  }

  // Info

  onNameChange(event) {
    this.setState({
      ...this.state,
      spotName: event.target.value,
    });
  }

  onStreetChange(event) {
    this.setState({
      ...this.state,
      street: event.target.value,
    });
  }

  onCityChange(event) {
    this.setState({
      ...this.state,
      city: event.target.value,
    });
  }

  onDescriptionChange(event) {
    this.setState({
      ...this.state,
      description: event.target.value,
    });
  }

  onIbanChange(event) {
    this.setState({
      ...this.state,
      iban: event.target.value,
    });
  }

  onBicChange(event) {
    this.setState({
      ...this.state,
      bic: event.target.value,
    });
  }

  changeOpeningHours(newDay) {
    const { openingHours } = this.state;
    this.setState({
      ...this.state,
      openingHours: { ...openingHours, ...newDay },
    });
  }

  getInfo() {
    const { formatMessage } = this.props.intl;
    const transitionProps = {
      enterDelay: 0,
      transitionDuration: 450,
    };
    const {
      nameOpened,
      addressOpened,
      descriptionOpened,
      openingHoursOpened,
      spotName,
      street,
      city,
      description,
      openingHours,
    } = this.state;
    return (
      <div>
        <span style={styles.header}>{formatMessage(messages.establishmentInfoHeader)}</span>
        <div style={styles.buttons}>
          {/** * Left div ** */}
          <div style={styles.splitDiv}>
            <FlatButton
              label={formatMessage(messages.nameBtn)}
              labelPosition={'after'}
              icon={<Star />}
              style={{}}
              onTouchTap={this.toggleName.bind(this)}
            />
            <ExpandTransition
              {...transitionProps}
              open={nameOpened}
            >
              <div style={styles.expansion}>
                <div style={styles.textfield}>
                  <StyledTextField
                    hintText={formatMessage(messages.nameHint)}
                    floatingLabelText={formatMessage(messages.nameLabel)}
                    onChange={this.onNameChange.bind(this)}
                    value={spotName}
                  />
                </div>
              </div>
            </ExpandTransition>
            <FlatButton
              label={formatMessage(messages.addressBtn)}
              labelPosition={'after'}
              icon={<Star />}
              style={{}}
              onTouchTap={this.toggleAddress.bind(this)}
            />
            <ExpandTransition
              {...transitionProps}
              open={addressOpened}
            >
              <div style={styles.expansion}>
                <div style={styles.textfield}>
                  <StyledTextField
                    hintText={formatMessage(messages.streetHint)}
                    floatingLabelText={formatMessage(messages.streetLabel)}
                    onChange={this.onStreetChange.bind(this)}
                    value={street}
                  />
                  <StyledTextField
                    hintText={formatMessage(messages.cityHint)}
                    floatingLabelText={formatMessage(messages.cityLabel)}
                    onChange={this.onCityChange.bind(this)}
                    value={city}
                  />
                </div>
              </div>
            </ExpandTransition>
            <FlatButton
              label={formatMessage(messages.descriptionBtn)}
              labelPosition={'after'}
              icon={<Star />}
              style={{}}
              onTouchTap={this.toggleDescription.bind(this)}
            />
            <ExpandTransition
              {...transitionProps}
              open={descriptionOpened}
            >
              <div style={styles.expansion}>
                <div style={styles.descriptionTextField}>
                  <StyledTextField
                    hintText={formatMessage(messages.descriptionHint)}
                    floatingLabelText={formatMessage(messages.descriptionLabel)}
                    multiLine
                    rows={6}
                    rowsMax={20}
                    onChange={this.onDescriptionChange.bind(this)}
                    value={description}
                  />
                </div>
              </div>
            </ExpandTransition>
          </div>
          {/** * Right div ** */}
          <div style={styles.splitDiv}>
            <FlatButton
              label={formatMessage(messages.openingHoursBtn)}
              labelPosition={'after'}
              icon={<Star />}
              onTouchTap={this.toggleOpeningHours.bind(this)}
            />
            <ExpandTransition
              {...transitionProps}
              open={openingHoursOpened}
            >
              <div style={styles.expansion}>
                <div style={styles.textfield}>
                  <div>
                    <span>{formatMessage(messages.monday)}</span>
                    <div style={styles.textGap} />
                    <TimePicker
                      hintText={formatMessage(messages.fromHint)}
                      onChange={(event, value) => { this.changeOpeningHours({ monday: { ...openingHours.monday, from: value } }); }}
                      value={openingHours.monday.from}
                      format="24hr"
                      style={styles.timePickerBase}
                      textFieldStyle={styles.timePickerTextField}
                    />
                    <div style={styles.textGap} />
                    <span>{'-'}</span>
                    <div style={styles.textGap} />
                    <TimePicker
                      hintText={formatMessage(messages.toHint)}
                      onChange={(event, value) => { this.changeOpeningHours({ monday: { ...openingHours.monday, to: value } }); }}
                      value={openingHours.monday.to}
                      format="24hr"
                      style={styles.timePickerBase}
                      textFieldStyle={styles.timePickerTextField}
                    />
                  </div>
                  <div>
                    <span>{formatMessage(messages.tuesday)}</span>
                    <div style={styles.textGap} />
                    <TimePicker
                      hintText={formatMessage(messages.fromHint)}
                      onChange={(event, value) => { this.changeOpeningHours({ tuesday: { ...openingHours.tuesday, from: value } }); }}
                      value={openingHours.tuesday.from}
                      format="24hr"
                      style={styles.timePickerBase}
                      textFieldStyle={styles.timePickerTextField}
                    />
                    <div style={styles.textGap} />
                    <span>{'-'}</span>
                    <div style={styles.textGap} />
                    <TimePicker
                      hintText={formatMessage(messages.toHint)}
                      onChange={(event, value) => { this.changeOpeningHours({ tuesday: { ...openingHours.tuesday, to: value } }); }}
                      value={openingHours.tuesday.to}
                      format="24hr"
                      style={styles.timePickerBase}
                      textFieldStyle={styles.timePickerTextField}
                    />
                  </div>
                  <div>
                    <span>{formatMessage(messages.wednesday)}</span>
                    <div style={styles.textGap} />
                    <TimePicker
                      hintText={formatMessage(messages.fromHint)}
                      onChange={(event, value) => { this.changeOpeningHours({ wednesday: { ...openingHours.wednesday, from: value } }); }}
                      value={openingHours.wednesday.from}
                      format="24hr"
                      style={styles.timePickerBase}
                      textFieldStyle={styles.timePickerTextField}
                    />
                    <div style={styles.textGap} />
                    <span>{'-'}</span>
                    <div style={styles.textGap} />
                    <TimePicker
                      hintText={formatMessage(messages.toHint)}
                      onChange={(event, value) => { this.changeOpeningHours({ wednesday: { ...openingHours.wednesday, to: value } }); }}
                      value={openingHours.wednesday.to}
                      format="24hr"
                      style={styles.timePickerBase}
                      textFieldStyle={styles.timePickerTextField}
                    />
                  </div>
                  <div>
                    <span>{formatMessage(messages.thursday)}</span>
                    <div style={styles.textGap} />
                    <TimePicker
                      hintText={formatMessage(messages.fromHint)}
                      onChange={(event, value) => { this.changeOpeningHours({ thursday: { ...openingHours.thursday, from: value } }); }}
                      value={openingHours.thursday.from}
                      format="24hr"
                      style={styles.timePickerBase}
                      textFieldStyle={styles.timePickerTextField}
                    />
                    <div style={styles.textGap} />
                    <span>{'-'}</span>
                    <div style={styles.textGap} />
                    <TimePicker
                      hintText={formatMessage(messages.toHint)}
                      onChange={(event, value) => { this.changeOpeningHours({ thursday: { ...openingHours.thursday, to: value } }); }}
                      value={openingHours.thursday.to}
                      format="24hr"
                      style={styles.timePickerBase}
                      textFieldStyle={styles.timePickerTextField}
                    />
                  </div>
                  <div>
                    <span>{formatMessage(messages.friday)}</span>
                    <div style={styles.textGap} />
                    <TimePicker
                      hintText={formatMessage(messages.fromHint)}
                      onChange={(event, value) => { this.changeOpeningHours({ friday: { ...openingHours.friday, from: value } }); }}
                      value={openingHours.friday.from}
                      format="24hr"
                      style={styles.timePickerBase}
                      textFieldStyle={styles.timePickerTextField}
                    />
                    <div style={styles.textGap} />
                    <span>{'-'}</span>
                    <div style={styles.textGap} />
                    <TimePicker
                      hintText={formatMessage(messages.toHint)}
                      onChange={(event, value) => { this.changeOpeningHours({ friday: { ...openingHours.friday, to: value } }); }}
                      value={openingHours.friday.to}
                      format="24hr"
                      style={styles.timePickerBase}
                      textFieldStyle={styles.timePickerTextField}
                    />
                  </div>
                  <div>
                    <span>{formatMessage(messages.saturday)}</span>
                    <div style={styles.textGap} />
                    <TimePicker
                      hintText={formatMessage(messages.fromHint)}
                      onChange={(event, value) => { this.changeOpeningHours({ saturday: { ...openingHours.saturday, from: value } }); }}
                      value={openingHours.saturday.from}
                      format="24hr"
                      style={styles.timePickerBase}
                      textFieldStyle={styles.timePickerTextField}
                    />
                    <div style={styles.textGap} />
                    <span>{'-'}</span>
                    <div style={styles.textGap} />
                    <TimePicker
                      hintText={formatMessage(messages.toHint)}
                      onChange={(event, value) => { this.changeOpeningHours({ saturday: { ...openingHours.saturday, to: value } }); }}
                      value={openingHours.saturday.to}
                      format="24hr"
                      style={styles.timePickerBase}
                      textFieldStyle={styles.timePickerTextField}
                    />
                  </div>
                  <div>
                    <span>{formatMessage(messages.sunday)}</span>
                    <div style={styles.textGap} />
                    <TimePicker
                      hintText={formatMessage(messages.fromHint)}
                      onChange={(event, value) => { this.changeOpeningHours({ sunday: { ...openingHours.sunday, from: value } }); }}
                      value={openingHours.sunday.from}
                      format="24hr"
                      style={styles.timePickerBase}
                      textFieldStyle={styles.timePickerTextField}
                    />
                    <div style={styles.textGap} />
                    <span>{'-'}</span>
                    <div style={styles.textGap} />
                    <TimePicker
                      hintText={formatMessage(messages.toHint)}
                      onChange={(event, value) => { this.changeOpeningHours({ sunday: { ...openingHours.sunday, to: value } }); }}
                      value={openingHours.sunday.to}
                      format="24hr"
                      style={styles.timePickerBase}
                      textFieldStyle={styles.timePickerTextField}
                    />
                  </div>
                </div>
              </div>
            </ExpandTransition>
          </div>
        </div>
      </div>
    );
  }

  // Pricing

  togglePricingOptions() {
    this.setState({
      ...this.state,
      pricingOptionsOpened: !this.state.pricingOptionsOpened,
    });
  }

  onAddToQueChange(event) {
    this.setState({
      ...this.state,
      addToQue: event.target.value,
    });
  }

  getPricing() {
    const { formatMessage } = this.props.intl;
    const {
      pricingOptionsOpened,
      accInfoOpened,
      iban,
      bic,
      addToQue,
    } = this.state;
    const transitionProps = {
      enterDelay: 0,
      transitionDuration: 450,
    };
    return (
      <div>
        <span style={styles.header}>{formatMessage(messages.pricingHeader)}</span>
        <div style={styles.buttons}>
          {/** * Left div ** */}
          <div style={styles.splitDiv}>
            <FlatButton
              label={formatMessage(messages.pricingOptionsBtn)}
              labelPosition={'after'}
              icon={<Star />}
              style={{}}
              onTouchTap={this.togglePricingOptions.bind(this)}
            />
            <ExpandTransition
              {...transitionProps}
              open={pricingOptionsOpened}
            >
              <div style={styles.expansion}>
                <div style={styles.textfield}>
                  <StyledTextField
                    hintText={formatMessage(messages.addToQueHint)}
                    floatingLabelText={formatMessage(messages.addToQueLabel)}
                    onChange={this.onAddToQueChange.bind(this)}
                    value={addToQue}
                    type={'number'}
                  />
                </div>
              </div>
            </ExpandTransition>
          </div>
          {/** * Right div ** */}
          <div style={styles.splitDiv}>
            <FlatButton
              label={formatMessage(messages.accInfoBtn)}
              labelPosition={'after'}
              icon={<Star />}
              style={{}}
              onTouchTap={this.toggleAccInfo.bind(this)}
            />
            <ExpandTransition
              {...transitionProps}
              open={accInfoOpened}
            >
              <div style={styles.expansion}>
                <div style={styles.textfield}>
                  <StyledTextField
                    hintText={formatMessage(messages.ibanHint)}
                    floatingLabelText={formatMessage(messages.ibanLabel)}
                    onChange={this.onIbanChange.bind(this)}
                    value={iban}
                  />
                  <StyledTextField
                    hintText={formatMessage(messages.bicHint)}
                    floatingLabelText={formatMessage(messages.bicLabel)}
                    onChange={this.onBicChange.bind(this)}
                    value={bic}
                  />
                </div>
              </div>
            </ExpandTransition>
          </div>
        </div>
      </div>
    );
  }

  // Overview

  getOverview() {
    const { formatMessage } = this.props.intl;
    const {
      spotName,
      street,
      city,
      description,
      iban,
      bic,
    } = this.state;
    return (
      <div>
        <span style={styles.header}>{spotName.length > 0 ? spotName : formatMessage(messages.emptyName)}</span>
        <p style={styles.text}>{description.length > 0 ? description : formatMessage(messages.emptyDescription)}</p>
        <span style={styles.header}>{formatMessage(messages.addressOverview)}</span>
        <p style={styles.text}>{
          street.length > 0 ? street : formatMessage(messages.emptyStreet)}
          <br />
          {city.length > 0 ? city : formatMessage(messages.emptyCity)}
        </p>
      </div>
    );
  }

  getContent(step) {
    switch (step) {
      case 0:
        return this.getIntroduction();
      case 1:
        return this.getInfo();
      case 2:
        return this.getPricing();
      case 3:
        return this.getOverview();
      default:
        return this.getIntroduction();
    }
  }

  handleNext() {
    const { stepIndex } = this.state;
    this.setState({
      ...this.state,
      stepIndex: stepIndex + 1,
    });
  }

  handlePrevious() {
    const { stepIndex } = this.state;
    this.setState({
      ...this.state,
      stepIndex: stepIndex - 1,
    });
  }

  toggleName() {
    this.setState({
      ...this.state,
      nameOpened: !this.state.nameOpened,
      descriptionOpened: false,
      addressOpened: false,
    });
  }

  toggleAddress() {
    this.setState({
      ...this.state,
      addressOpened: !this.state.addressOpened,
      descriptionOpened: false,
      nameOpened: false,
    });
  }

  toggleDescription() {
    this.setState({
      ...this.state,
      descriptionOpened: !this.state.descriptionOpened,
      nameOpened: false,
      addressOpened: false,
    });
  }

  toggleAccInfo() {
    this.setState({
      ...this.state,
      accInfoOpened: !this.state.accInfoOpened,
    });
  }

  toggleOpeningHours() {
    this.setState({
      ...this.state,
      openingHoursOpened: !this.state.openingHoursOpened,
    });
  }

  preparePrivateData() {
    const { iban, bic } = this.state;
    const spotData = {
      billingInfo: {
        bankAcount: iban,
        variableSymbol: bic,
      },
    };
    return spotData;
  }

  preparePublicData() {
    const { spotName, description, street, city, addToQue } = this.state;
    const spotData = {
      name: spotName,
      active: false,
      description,
      rating: 5,
      address: `${street} ${city}`,
      location: {
        latitude: 0.0,
        longitude: 0.0,
      },
      paymentOptions: {
        addToEnd: addToQue,
      },
    };
    return spotData;
  }

  handleFinish() {
    const privateData = this.preparePrivateData();
    const publicData = this.preparePublicData();
    this.props.registerSpot(publicData, privateData);
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { stepIndex } = this.state;
    const { registerSpot, cancelRegistration } = this.props;
    return (
      <div style={styles.base}>
        <ScrollPane>
          {this.getContent(stepIndex)}
        </ScrollPane>
        <div style={styles.buttons}>
          <FlatButton
            label={formatMessage(stepIndex > 0 ? messages.previousBtn : messages.cancelBtn)}
            labelPosition={'after'}
            icon={
              stepIndex > 0 ? <PreviousArrow /> : <CancelIcon />
            }
            onTouchTap={
              stepIndex > 0 ? this.handlePrevious.bind(this) : cancelRegistration
            }
          />
          <div style={styles.ghost} />
          <FlatButton
            label={formatMessage(stepIndex < 3 ? messages.nextBtn : messages.finishBtn)}
            labelPosition={'before'}
            icon={stepIndex < 3 ? <NextArrow /> : <FinishIcon />}
            onTouchTap={
              stepIndex < 3 ? this.handleNext.bind(this) : this.handleFinish.bind(this)
            }
          />
        </div>
        <Stepper activeStep={stepIndex}>
          <Step>
            <StepLabel>
              {formatMessage(messages.introStep)}
            </StepLabel>
          </Step>
          <Step>
            <StepLabel /* icon={<Info color={deepOrange500}/>} */>
              {formatMessage(messages.establishmentInfoStep)}
            </StepLabel>
          </Step>
          <Step>
            <StepLabel>
              {formatMessage(messages.pricingStep)}
            </StepLabel>
          </Step>
          <Step>
            <StepLabel>
              {formatMessage(messages.overviewStep)}
            </StepLabel>
          </Step>
        </Stepper>
      </div>
    );
  }
}

export default injectIntl(SpotRegister);
