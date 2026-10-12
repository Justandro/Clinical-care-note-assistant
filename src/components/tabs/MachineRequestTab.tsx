import React, { useState } from 'react';
import { copyText } from '../../utils/clipboard';
import { usePersistentState } from '../../utils/usePersistentState';
import { GeneratedNotePreview } from '../GeneratedNotePreview';
import { WarningAlert } from '../Alerts';

interface Props {
  showToast: (msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export const MachineRequestTab: React.FC<Props> = ({ showToast }) => {
  const [reqType, setReqType] = usePersistentState<'RUW' | 'LOANER' | 'SWAPOUT' | 'RESHIP'>('mr_reqType', 'RUW');
  const [wrong, setWrong] = usePersistentState<string>('mr_wrong', '');
  const [troubleshoot, setTroubleshoot] = usePersistentState<string>('mr_troubleshoot', '');
  const [optText, setOptText] = usePersistentState<string>('mr_optText', 'No');
  const [shipping, setShipping] = usePersistentState<string>('mr_shipping', 'UPS Ground Shipping (Default)');

  // RUW state
  const [ruwMake, setRuwMake] = usePersistentState<string>('mr_ruwMake', '');
  const [ruwModel, setRuwModel] = usePersistentState<string>('mr_ruwModel', '');
  const [ruwSerial, setRuwSerial] = usePersistentState<string>('mr_ruwSerial', '');
  const [ruwSetup, setRuwSetup] = usePersistentState<string>('mr_ruwSetup', '');
  const [ruwPressure, setRuwPressure] = usePersistentState<string>('mr_ruwPressure', '');
  const [ruwRx, setRuwRx] = usePersistentState<string>('mr_ruwRx', '');
  const [ruwAware, setRuwAware] = usePersistentState<string>('mr_ruwAware', 'No');
  const [ruwC2c, setRuwC2c] = usePersistentState<string>('mr_ruwC2c', 'N/A');
  const [ruwOzone, setRuwOzone] = usePersistentState<string>('mr_ruwOzone', 'No');
  const [ruwDump, setRuwDump] = usePersistentState<string>('mr_ruwDump', 'No');
  const [ruwDamage, setRuwDamage] = usePersistentState<string>('mr_ruwDamage', 'No');

  // LOANER state
  const [loanerPurch, setLoanerPurch] = usePersistentState<string>('mr_loanerPurch', '');
  const [loanerElig, setLoanerElig] = usePersistentState<string>('mr_loanerElig', '');
  const [loanerType, setLoanerType] = usePersistentState<string>('mr_loanerType', 'APAP');
  const [loanerPressure, setLoanerPressure] = usePersistentState<string>('mr_loanerPressure', '');
  const [loanerRx, setLoanerRx] = usePersistentState<string>('mr_loanerRx', '');
  const [loanerReason, setLoanerReason] = usePersistentState<string>('mr_loanerReason', '');
  const [loanerBilled, setLoanerBilled] = usePersistentState<string>('mr_loanerBilled', 'No');
  const [loanerReturned, setLoanerReturned] = usePersistentState<string>('mr_loanerReturned', 'No');

  // SWAPOUT state
  const [swapRetMake, setSwapRetMake] = usePersistentState<string>('mr_swapRetMake', '');
  const [swapRetModel, setSwapRetModel] = usePersistentState<string>('mr_swapRetModel', '');
  const [swapRetSerial, setSwapRetSerial] = usePersistentState<string>('mr_swapRetSerial', '');
  const [swapRetPres, setSwapRetPres] = usePersistentState<string>('mr_swapRetPres', '');
  const [swapRetRx, setSwapRetRx] = usePersistentState<string>('mr_swapRetRx', '');
  const [swapNewMake, setSwapNewMake] = usePersistentState<string>('mr_swapNewMake', '');
  const [swapNewModel, setSwapNewModel] = usePersistentState<string>('mr_swapNewModel', '');
  const [swapNewPres, setSwapNewPres] = usePersistentState<string>('mr_swapNewPres', '');
  const [swapC2c, setSwapC2c] = usePersistentState<string>('mr_swapC2c', 'N/A');
  const [swapAware, setSwapAware] = usePersistentState<string>('mr_swapAware', 'No');
  const [swapDump, setSwapDump] = usePersistentState<string>('mr_swapDump', 'No');
  const [swapReason, setSwapReason] = usePersistentState<string>('mr_swapReason', '-MD/Facility/Sales Rep Swapped');

  // RESHIP state
  const [reshipMake, setReshipMake] = usePersistentState<string>('mr_reshipMake', '');
  const [reshipModel, setReshipModel] = usePersistentState<string>('mr_reshipModel', '');
  const [reshipSerial, setReshipSerial] = usePersistentState<string>('mr_reshipSerial', '');
  const [reshipSetup, setReshipSetup] = usePersistentState<string>('mr_reshipSetup', '');
  const [reshipPres, setReshipPres] = usePersistentState<string>('mr_reshipPres', '');
  const [reshipRx, setReshipRx] = usePersistentState<string>('mr_reshipRx', '');

  // Diagnostic templates
  const [templateType, setTemplateType] = usePersistentState<string>('mr_templateType', 'N/A');

  // Noise
  const [noise1, setNoise1] = usePersistentState<string>('mr_noise1', 'No');
  const [noise2, setNoise2] = usePersistentState<string>('mr_noise2', '');
  const [noise3, setNoise3] = usePersistentState<string>('mr_noise3', 'No');
  const [noise4, setNoise4] = usePersistentState<string>('mr_noise4', 'No');
  const [noise5, setNoise5] = usePersistentState<string>('mr_noise5', 'No');
  const [noise6, setNoise6] = usePersistentState<string>('mr_noise6', 'No');
  const [noise7, setNoise7] = usePersistentState<string>('mr_noise7', 'No');
  const [noise8, setNoise8] = usePersistentState<string>('mr_noise8', 'No');

  // No Air
  const [noAir1, setNoAir1] = usePersistentState<string>('mr_noAir1', 'No');
  const [noAir2, setNoAir2] = usePersistentState<string>('mr_noAir2', 'No');
  const [noAir3, setNoAir3] = usePersistentState<string>('mr_noAir3', 'No');
  const [noAir4, setNoAir4] = usePersistentState<string>('mr_noAir4', 'No');
  const [noAir5, setNoAir5] = usePersistentState<string>('mr_noAir5', 'No');
  const [noAir6, setNoAir6] = usePersistentState<string>('mr_noAir6', 'No');
  const [noAir7, setNoAir7] = usePersistentState<string>('mr_noAir7', 'No');

  // Loss Pressure
  const [lossPres1, setLossPres1] = usePersistentState<string>('mr_lossPres1', 'No');
  const [lossPres2, setLossPres2] = usePersistentState<string>('mr_lossPres2', '');
  const [lossPres3, setLossPres3] = usePersistentState<string>('mr_lossPres3', 'No');
  const [lossPres4, setLossPres4] = usePersistentState<string>('mr_lossPres4', 'No');
  const [lossPres5, setLossPres5] = usePersistentState<string>('mr_lossPres5', 'No');
  const [lossPres6, setLossPres6] = usePersistentState<string>('mr_lossPres6', 'No');

  // Humidifier Heat
  const [humHeat1, setHumHeat1] = usePersistentState<string>('mr_humHeat1', 'No');
  const [humHeat2, setHumHeat2] = usePersistentState<string>('mr_humHeat2', 'No');

  // Rain out
  const [rainOut1, setRainOut1] = usePersistentState<string>('mr_rainOut1', 'No');
  const [rainOut2, setRainOut2] = usePersistentState<string>('mr_rainOut2', 'No');
  const [rainOut3, setRainOut3] = usePersistentState<string>('mr_rainOut3', 'No');

  // No Turn On
  const [noTurnOn1, setNoTurnOn1] = usePersistentState<string>('mr_noTurnOn1', 'No');
  const [noTurnOn2, setNoTurnOn2] = usePersistentState<string>('mr_noTurnOn2', 'No');
  const [noTurnOn3, setNoTurnOn3] = usePersistentState<string>('mr_noTurnOn3', 'No');
  const [noTurnOn4, setNoTurnOn4] = usePersistentState<string>('mr_noTurnOn4', 'No');
  const [noTurnOn5, setNoTurnOn5] = usePersistentState<string>('mr_noTurnOn5', 'No');

  // No Data
  const [noData1, setNoData1] = usePersistentState<string>('mr_noData1', '');
  const [noData2, setNoData2] = usePersistentState<string>('mr_noData2', '');
  const [noData3, setNoData3] = usePersistentState<string>('mr_noData3', 'No');
  const [noData4, setNoData4] = usePersistentState<string>('mr_noData4', '');
  const [noData5, setNoData5] = usePersistentState<string>('mr_noData5', 'No');
  const [noData6, setNoData6] = usePersistentState<string>('mr_noData6', 'No');
  const [noData7, setNoData7] = usePersistentState<string>('mr_noData7', 'No');

  // Lost Reship
  const [lostReship1, setLostReship1] = usePersistentState<string>('mr_lostReship1', '');
  const [lostReship2, setLostReship2] = usePersistentState<string>('mr_lostReship2', 'No');
  const [lostReship3, setLostReship3] = usePersistentState<string>('mr_lostReship3', '');

  // Lost Fire
  const [lostFire1, setLostFire1] = usePersistentState<string>('mr_lostFire1', '');
  const [lostFire2, setLostFire2] = usePersistentState<string>('mr_lostFire2', 'Fire');

  const generateTitle = (): string => {
    const typeStr =
      reqType === 'RUW'
        ? 'RUW'
        : reqType === 'LOANER'
        ? 'Loaner'
        : reqType === 'SWAPOUT'
        ? 'Swap Out'
        : 'Reship';
    return `CC-${typeStr} Request^Reason^`;
  };

  const generateBody = (): string => {
    let body = `*WHAT IS THE PATIENT STATING IS WRONG WITH THEIR MACHINE?: ${wrong.trim()}
*WHAT DID YOU DO TO TROUBLESHOOT?: ${troubleshoot.trim()}
Does patient wish to opt-in to text: ${optText}

Shipping Method: ${shipping}
`;

    if (reqType === 'RUW') {
      body += `\nRUW - Machine/Humidifier is UNDER 2 YEARS
Current Machine Make (REQUIRED): ${ruwMake.trim()}
Current Machine Model (REQUIRED): ${ruwModel.trim()}
Current Machine Serial Number (REQUIRED): ${ruwSerial.trim()}
Original set-up date (REQUIRED): ${ruwSetup.trim()}
Pressure listed on RX (REQUIRED): ${ruwPressure.trim()}
RX dated (REQUIRED): ${ruwRx.trim()}
Is patient aware all parts need to be returned with broken unit within 30 days or pt will be billed for machine (including power supply and carrying case)? ${ruwAware}
IS PT OKAY W/ C2C?: ${ruwC2c}
*IF SAME MANUFACTURER; PT MUST KEEP ALL SUPPLIES!*
Is patient using Ozone cleaner with machine? ${ruwOzone}
Was the patient informed to dump water before returning? ${ruwDump}
Does the machine have water damage/smoke damage/mold/infestation/ozone exposure? If yes, machine is not covered under warranty. ${ruwDamage}`;
    } else if (reqType === 'LOANER') {
      body += `\nLOANER - Machine/Humidifier is OVER 2 YEARS AND LESS THAN 5 YEARS
(7-10 business days for delivery)
Date of last machine purchase (REQUIRED): ${loanerPurch.trim()}
New machine eligibility date (REQUIRED): ${loanerElig.trim()}
(OP to add stop to sales order with this date.)
Type of machine: ${loanerType}
Pressure listed on RX (REQUIRED): ${loanerPressure.trim()}
RX dated (REQUIRED): ${loanerRx.trim()}
Reason loaner requested/issue with machine (REQUIRED): ${loanerReason.trim()}
Is patient aware ins will be billed for 1 month loaner? ${loanerBilled}
Was pt informed loaner will need to be returned once eligible for 5-year replacement?: ${loanerReturned}`;
    } else if (reqType === 'SWAPOUT') {
      body += `\nSWAPOUT-Patient will RETURN the following items (REQUIRED): 
Make: ${swapRetMake.trim()}
Model: ${swapRetModel.trim()}
Serial #: ${swapRetSerial.trim()}
Pressure listed on RX(REQUIRED): ${swapRetPres.trim()}
RX dated (REQUIRED): ${swapRetRx.trim()}
Patient will be SWITCHING to the following items (REQUIRED): 
Make: ${swapNewMake.trim()}
Model: ${swapNewModel.trim()}
Pressure: ${swapNewPres.trim()}
IS PATIENT OKAY W/ C2C?: ${swapC2c}
Is patient aware everything must be returned within 30 days or pt will be billed for machine? ${swapAware}
Was the patient informed to dump water before returning? ${swapDump}
SWAPOUT REASON (OP to enter in MaskSwap Reason): 
${swapReason}`;
    } else if (reqType === 'RESHIP') {
      body += `\nRESHIP- Machine/Humidifier was not delivered/lost in transit 
Machine Make (REQUIRED): ${reshipMake.trim()}
Machine Model (REQUIRED): ${reshipModel.trim()}
Machine Serial Number (REQUIRED): ${reshipSerial.trim()}
Original set-up date (REQUIRED): ${reshipSetup.trim()}
Pressure listed on RX (REQUIRED): ${reshipPres.trim()}
RX dated (REQUIRED): ${reshipRx.trim()}`;
    }

    if (templateType === 'N/A' || !templateType) {
      body += `\n\nFill out template that applies to any issue the patient is experiencing: N/A`;
    } else {
      body += `\n\nFill out template that applies to any issue the patient is experiencing:\n`;

      if (templateType === 'noise') {
        body += `Noise:
If the patient has AirSense 10/11, are they experiencing a winding noise? ${noise1}
What type of noise is the patient hearing? ${noise2.trim()}
Did patient disconnect mask and tubing and reconnect to the machine? ${noise3}
Did patient check seals on machine and humidifier and make sure they are in place? ${noise4}
Did the patient remove the humidifier on Dreamstation and re attach? ${noise5}
Did the patient take the water chamber off the ResMed and check the seal? ${noise6}
Did the patient make sure that the filters are clean? ${noise7}
Did you check for any loose components? ${noise8}`;
      } else if (templateType === 'no_air') {
        body += `No air blowing out from machine:
Did you check to make sure the tube is connected properly with no holes in It? ${noAir1}
Did you check the filters to make sure clean to avoid blockages? ${noAir2}
Did you check multiple power outlets? ${noAir3}
Did you make sure not plugged into anything but a wall outlet? ${noAir4}
Did we already send a new power cord as that may be the issue? ${noAir5}
Did you check Airview to see if Smart Start if on? ${noAir6}
Did the pt drop the machine? ${noAir7}`;
      } else if (templateType === 'loss_pres') {
        body += `Loss of pressure:
Did the patient take humidifier out and reattach seal? *Cannot remove seals on ResMed machines.* ${lossPres1}
When is the last time the patient changed the filter? ${lossPres2.trim()}
Did patient remove the tubing? ${lossPres3}
                Is the machine blowing normally without the tubing attached? ${lossPres4}
                If yes; attach tube to the machine, is the machine blowing normally with tubing attached? ${lossPres5}
                If yes; attach the mask, is the machine blowing normally with tubing and mask attached? ${lossPres6}`;
      } else if (templateType === 'hum_heat') {
        body += `Humidifier is not heating up:
Have pt run the machine for a minute or two then turn off.
Does the patient feel heat coming from the plate? ${humHeat1}
Is the humidifier on fixed mode? ${humHeat2}`;
      } else if (templateType === 'rain_out') {
        body += `Rain out not resolving:
Does the pt have a heated tube? ${rainOut1}
                (If not send heated tube)
Is the heated tube on? ${rainOut2}
Have several attempts been made to adjust both heated tube and humidity? ${rainOut3}`;
      } else if (templateType === 'no_turn_on') {
        body += `Machine will not turn on:
Did the patient try an alternative power source? ${noTurnOn1}
Did the patient unplug the power source from the machine and wall and reconnect it? ${noTurnOn2}
Did the patient disconnect the power adapters from each other and plug them back in? ${noTurnOn3}
Is the green light on, on the power supply? ${noTurnOn4}
If no replace the power cord/supply first.
Did you check AirView to see if Smart Start if on? ${noTurnOn5}`;
      } else if (templateType === 'no_data') {
        body += `Not recording data:
(Not applicable for loaner request)
ResMed: 
Check signal strength (should be at least 4 bars:) 
How many bars are showing? ${noData1.trim()}
What is the serial number from the patients machine? (Get this from the patient we may have it incorrect in our system.) ${noData2.trim()}
React:
Check machine has a modem:
Was power cycle done? ${noData3}
How many bars are showing? ${noData4.trim()}
Scan QR+ code, does it transmit data? ${noData5}
Get iCodes, does it pull data? ${noData6}
Does the machine have data on it? ${noData7}`;
      } else if (templateType === 'lost_reship') {
        body += `Lost/Stolen/Reship:
Can you please confirm your address? ${lostReship1.trim()}
Is it a common occurrence to have missing packages? ${lostReship2}
What does tracking number indicate? ${lostReship3.trim()}`;
      } else if (templateType === 'lost_fire') {
        body += `Lost in Fire/Hurricane:
Confirm delivery address: ${lostFire1.trim()}
Was the machine lost due to fire or hurricane?: ${lostFire2}`;
      }
    }

    return body.trim();
  };

  const handleCopyTitle = async () => {
    const ok = await copyText(generateTitle());
    if (ok) showToast('Title copied to clipboard!', 'success');
  };

  const handleCopyBody = async () => {
    const ok = await copyText(generateBody());
    if (ok) showToast('Body copied to clipboard!', 'success');
  };

  const handleClear = () => {
    setReqType('RUW');
    setWrong('');
    setTroubleshoot('');
    setOptText('No');
    setShipping('UPS Ground Shipping (Default)');

    setRuwMake('');
    setRuwModel('');
    setRuwSerial('');
    setRuwSetup('');
    setRuwPressure('');
    setRuwRx('');
    setRuwAware('No');
    setRuwC2c('N/A');
    setRuwOzone('No');
    setRuwDump('No');
    setRuwDamage('No');

    setLoanerPurch('');
    setLoanerElig('');
    setLoanerType('APAP');
    setLoanerPressure('');
    setLoanerRx('');
    setLoanerReason('');
    setLoanerBilled('No');
    setLoanerReturned('No');

    setSwapRetMake('');
    setSwapRetModel('');
    setSwapRetSerial('');
    setSwapRetPres('');
    setSwapRetRx('');
    setSwapNewMake('');
    setSwapNewModel('');
    setSwapNewPres('');
    setSwapC2c('N/A');
    setSwapAware('No');
    setSwapDump('No');
    setSwapReason('-MD/Facility/Sales Rep Swapped');

    setReshipMake('');
    setReshipModel('');
    setReshipSerial('');
    setReshipSetup('');
    setReshipPres('');
    setReshipRx('');

    setTemplateType('N/A');
    setNoise1('No'); setNoise2(''); setNoise3('No'); setNoise4('No'); setNoise5('No'); setNoise6('No'); setNoise7('No'); setNoise8('No');
    setNoAir1('No'); setNoAir2('No'); setNoAir3('No'); setNoAir4('No'); setNoAir5('No'); setNoAir6('No'); setNoAir7('No');
    setLossPres1('No'); setLossPres2(''); setLossPres3('No'); setLossPres4('No'); setLossPres5('No'); setLossPres6('No');
    setHumHeat1('No'); setHumHeat2('No');
    setRainOut1('No'); setRainOut2('No'); setRainOut3('No');
    setNoTurnOn1('No'); setNoTurnOn2('No'); setNoTurnOn3('No'); setNoTurnOn4('No'); setNoTurnOn5('No');
    setNoData1(''); setNoData2(''); setNoData3('No'); setNoData4(''); setNoData5('No'); setNoData6('No'); setNoData7('No');
    setLostReship1(''); setLostReship2('No'); setLostReship3('');
    setLostFire1(''); setLostFire2('Fire');

    showToast('Form cleared!', 'info');
  };

  return (
    <div id="machine-request" className="tab-content active">
      <div className="form-section">
        <h3>Select Request Type</h3>
        <div className="form-group">
          <select
            id="mr_request_type"
            value={reqType}
            onChange={(e) => setReqType(e.target.value as any)}
          >
            <option value="RUW">RUW (Machine/Humidifier UNDER 2 YEARS)</option>
            <option value="LOANER">LOANER (Machine OVER 2 YEARS AND LESS THAN 5 YEARS)</option>
            <option value="SWAPOUT">SWAPOUT (Patient switching items)</option>
            <option value="RESHIP">RESHIP (Not delivered/lost in transit)</option>
          </select>
        </div>
      </div>

      <div className="form-section">
        <h3>Common Fields</h3>
        <div className="form-group">
          <label htmlFor="mr_wrong">*WHAT IS THE PATIENT STATING IS WRONG WITH THEIR MACHINE?:</label>
          <input
            type="text"
            id="mr_wrong"
            placeholder="Enter patient's issue..."
            value={wrong}
            onChange={(e) => setWrong(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="mr_troubleshoot">*WHAT DID YOU DO TO TROUBLESHOOT?:</label>
          <input
            type="text"
            id="mr_troubleshoot"
            placeholder="Enter troubleshooting steps..."
            value={troubleshoot}
            onChange={(e) => setTroubleshoot(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Does patient wish to opt-in to text:</label>
          <div className="radio-group">
            {['Yes', 'No', 'N/A'].map((opt) => (
              <div key={opt} className="radio-item">
                <input
                  type="radio"
                  name="mr_opt_text"
                  id={`mr_opt_${opt}`}
                  value={opt}
                  checked={optText === opt}
                  onChange={(e) => setOptText(e.target.value)}
                />
                <label htmlFor={`mr_opt_${opt}`}>{opt}</label>
              </div>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label>Shipping Method:</label>
          <div className="radio-group">
            {[
              'UPS Ground Shipping (Default)',
              'UPS 2nd Day Air (must be approved)',
              'UPS Overnight (must be approved)',
            ].map((m) => (
              <div key={m} className="radio-item">
                <input
                  type="radio"
                  name="mr_shipping"
                  id={`mr_ship_${m}`}
                  value={m}
                  checked={shipping === m}
                  onChange={(e) => setShipping(e.target.value)}
                />
                <label htmlFor={`mr_ship_${m}`}>{m}</label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {reqType === 'RUW' && (
        <div id="mr_ruw_section" className="form-section">
          <h3>RUW - Machine/Humidifier is UNDER 2 YEARS</h3>
          <div className="grid grid-2">
            <div className="form-group">
              <label>Current Machine Make (REQUIRED):</label>
              <input
                type="text"
                id="mr_ruw_make"
                value={ruwMake}
                onChange={(e) => setRuwMake(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Current Machine Model (REQUIRED):</label>
              <input
                type="text"
                id="mr_ruw_model"
                value={ruwModel}
                onChange={(e) => setRuwModel(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Current Machine Serial Number (REQUIRED):</label>
              <input
                type="text"
                id="mr_ruw_serial"
                value={ruwSerial}
                onChange={(e) => setRuwSerial(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Original set-up date (REQUIRED):</label>
              <input
                type="date"
                id="mr_ruw_setup"
                value={ruwSetup}
                onChange={(e) => setRuwSetup(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Pressure listed on RX (REQUIRED):</label>
              <input
                type="text"
                id="mr_ruw_pressure"
                value={ruwPressure}
                onChange={(e) => setRuwPressure(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>RX dated (REQUIRED):</label>
              <input
                type="date"
                id="mr_ruw_rx"
                value={ruwRx}
                onChange={(e) => setRuwRx(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              Is patient aware all parts need to be returned with broken unit within 30 days or pt will be billed for machine (including power supply and carrying case)?
            </label>
            <div className="radio-group">
              <div className="radio-item">
                <input
                  type="radio"
                  name="mr_ruw_aware"
                  value="Yes"
                  checked={ruwAware === 'Yes'}
                  onChange={(e) => setRuwAware(e.target.value)}
                />
                <label>Yes</label>
              </div>
              <div className="radio-item">
                <input
                  type="radio"
                  name="mr_ruw_aware"
                  value="No"
                  checked={ruwAware === 'No'}
                  onChange={(e) => setRuwAware(e.target.value)}
                />
                <label>No</label>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>IS PT OKAY W/ C2C?:</label>
            <div className="radio-group">
              {['Yes', 'No', 'N/A'].map((opt) => (
                <div key={opt} className="radio-item">
                  <input
                    type="radio"
                    name="mr_ruw_c2c"
                    value={opt}
                    checked={ruwC2c === opt}
                    onChange={(e) => setRuwC2c(e.target.value)}
                  />
                  <label>{opt}</label>
                </div>
              ))}
            </div>
          </div>

          <WarningAlert className="mb-6">
            <p><strong>*IF SAME MANUFACTURER; PT MUST KEEP ALL SUPPLIES!*</strong></p>
          </WarningAlert>

          <div className="form-group">
            <label>Is patient using Ozone cleaner with machine?</label>
            <div className="radio-group">
              <div className="radio-item">
                <input
                  type="radio"
                  name="mr_ruw_ozone"
                  value="Yes"
                  checked={ruwOzone === 'Yes'}
                  onChange={(e) => setRuwOzone(e.target.value)}
                />
                <label>Yes</label>
              </div>
              <div className="radio-item">
                <input
                  type="radio"
                  name="mr_ruw_ozone"
                  value="No"
                  checked={ruwOzone === 'No'}
                  onChange={(e) => setRuwOzone(e.target.value)}
                />
                <label>No</label>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Was the patient informed to dump water before returning?</label>
            <div className="radio-group">
              <div className="radio-item">
                <input
                  type="radio"
                  name="mr_ruw_dump"
                  value="Yes"
                  checked={ruwDump === 'Yes'}
                  onChange={(e) => setRuwDump(e.target.value)}
                />
                <label>Yes</label>
              </div>
              <div className="radio-item">
                <input
                  type="radio"
                  name="mr_ruw_dump"
                  value="No"
                  checked={ruwDump === 'No'}
                  onChange={(e) => setRuwDump(e.target.value)}
                />
                <label>No</label>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>
              Does the machine have water damage/smoke damage/mold/infestation/ozone exposure? If yes, machine is not covered under warranty.
            </label>
            <div className="radio-group">
              <div className="radio-item">
                <input
                  type="radio"
                  name="mr_ruw_damage"
                  value="Yes"
                  checked={ruwDamage === 'Yes'}
                  onChange={(e) => setRuwDamage(e.target.value)}
                />
                <label>Yes</label>
              </div>
              <div className="radio-item">
                <input
                  type="radio"
                  name="mr_ruw_damage"
                  value="No"
                  checked={ruwDamage === 'No'}
                  onChange={(e) => setRuwDamage(e.target.value)}
                />
                <label>No</label>
              </div>
            </div>
          </div>
        </div>
      )}

      {reqType === 'LOANER' && (
        <div id="mr_loaner_section" className="form-section">
          <h3>LOANER - Machine/Humidifier is OVER 2 YEARS AND LESS THAN 5 YEARS</h3>
          <div className="text-small mb-10">(7-10 business days for delivery)</div>
          <div className="grid grid-2">
            <div className="form-group">
              <label>Date of last machine purchase (REQUIRED):</label>
              <input
                type="date"
                id="mr_loaner_purch"
                value={loanerPurch}
                onChange={(e) => setLoanerPurch(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>New machine eligibility date (REQUIRED):</label>
              <input
                type="date"
                id="mr_loaner_elig"
                value={loanerElig}
                onChange={(e) => setLoanerElig(e.target.value)}
              />
              <div className="text-small text-whiteold text-orange mt-1">
                (OP to add stop to sales order with this date.)
              </div>
            </div>
            <div className="form-group">
              <label>Type of machine:</label>
              <select
                id="mr_loaner_type"
                value={loanerType}
                onChange={(e) => setLoanerType(e.target.value)}
              >
                <option value="APAP">APAP</option>
                <option value="BIPAP">BIPAP</option>
                <option value="BIPAP ST">BIPAP ST</option>
                <option value="ASV">ASV</option>
              </select>
            </div>
            <div className="form-group">
              <label>Pressure listed on RX (REQUIRED):</label>
              <input
                type="text"
                id="mr_loaner_pressure"
                value={loanerPressure}
                onChange={(e) => setLoanerPressure(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>RX dated (REQUIRED):</label>
              <input
                type="date"
                id="mr_loaner_rx"
                value={loanerRx}
                onChange={(e) => setLoanerRx(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="mr_loaner_reason">Reason loaner requested/issue with machine (REQUIRED):</label>
            <textarea
              id="mr_loaner_reason"
              placeholder="Please describe..."
              value={loanerReason}
              onChange={(e) => setLoanerReason(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Is patient aware ins will be billed for 1 month loaner?</label>
            <div className="radio-group">
              <div className="radio-item">
                <input
                  type="radio"
                  name="mr_loaner_billed"
                  value="Yes"
                  checked={loanerBilled === 'Yes'}
                  onChange={(e) => setLoanerBilled(e.target.value)}
                />
                <label>Yes</label>
              </div>
              <div className="radio-item">
                <input
                  type="radio"
                  name="mr_loaner_billed"
                  value="No"
                  checked={loanerBilled === 'No'}
                  onChange={(e) => setLoanerBilled(e.target.value)}
                />
                <label>No</label>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Was pt informed loaner will need to be returned once eligible for 5-year replacement?:</label>
            <div className="radio-group">
              <div className="radio-item">
                <input
                  type="radio"
                  name="mr_loaner_returned"
                  value="Yes"
                  checked={loanerReturned === 'Yes'}
                  onChange={(e) => setLoanerReturned(e.target.value)}
                />
                <label>Yes</label>
              </div>
              <div className="radio-item">
                <input
                  type="radio"
                  name="mr_loaner_returned"
                  value="No"
                  checked={loanerReturned === 'No'}
                  onChange={(e) => setLoanerReturned(e.target.value)}
                />
                <label>No</label>
              </div>
            </div>
          </div>
        </div>
      )}

      {reqType === 'SWAPOUT' && (
        <div id="mr_swapout_section" className="form-section">
          <h3 className="text-red">SWAPOUT-Patient will RETURN the following items (REQUIRED):</h3>
          <div className="grid grid-2">
            <div className="form-group">
              <label>Make:</label>
              <input
                type="text"
                id="mr_swap_ret_make"
                value={swapRetMake}
                onChange={(e) => setSwapRetMake(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Model:</label>
              <input
                type="text"
                id="mr_swap_ret_model"
                value={swapRetModel}
                onChange={(e) => setSwapRetModel(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Serial #:</label>
              <input
                type="text"
                id="mr_swap_ret_serial"
                value={swapRetSerial}
                onChange={(e) => setSwapRetSerial(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Pressure listed on RX(REQUIRED):</label>
              <input
                type="text"
                id="mr_swap_ret_pres"
                value={swapRetPres}
                onChange={(e) => setSwapRetPres(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>RX dated (REQUIRED):</label>
              <input
                type="date"
                id="mr_swap_ret_rx"
                value={swapRetRx}
                onChange={(e) => setSwapRetRx(e.target.value)}
              />
            </div>
          </div>

          <h3 className="text-green mt-5">Patient will be SWITCHING to the following items (REQUIRED):</h3>
          <div className="grid grid-2">
            <div className="form-group">
              <label>Make:</label>
              <input
                type="text"
                id="mr_swap_new_make"
                value={swapNewMake}
                onChange={(e) => setSwapNewMake(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Model:</label>
              <input
                type="text"
                id="mr_swap_new_model"
                value={swapNewModel}
                onChange={(e) => setSwapNewModel(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Pressure:</label>
              <input
                type="text"
                id="mr_swap_new_pres"
                value={swapNewPres}
                onChange={(e) => setSwapNewPres(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>IS PATIENT OKAY W/ C2C?:</label>
            <div className="radio-group">
              {['Yes', 'No', 'N/A'].map((opt) => (
                <div key={opt} className="radio-item">
                  <input
                    type="radio"
                    name="mr_swap_c2c"
                    value={opt}
                    checked={swapC2c === opt}
                    onChange={(e) => setSwapC2c(e.target.value)}
                  />
                  <label>{opt}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Is patient aware everything must be returned within 30 days or pt will be billed for machine?</label>
            <div className="radio-group">
              <div className="radio-item">
                <input
                  type="radio"
                  name="mr_swap_aware"
                  value="Yes"
                  checked={swapAware === 'Yes'}
                  onChange={(e) => setSwapAware(e.target.value)}
                />
                <label>Yes</label>
              </div>
              <div className="radio-item">
                <input
                  type="radio"
                  name="mr_swap_aware"
                  value="No"
                  checked={swapAware === 'No'}
                  onChange={(e) => setSwapAware(e.target.value)}
                />
                <label>No</label>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Was the patient informed to dump water before returning?</label>
            <div className="radio-group">
              <div className="radio-item">
                <input
                  type="radio"
                  name="mr_swap_dump"
                  value="Yes"
                  checked={swapDump === 'Yes'}
                  onChange={(e) => setSwapDump(e.target.value)}
                />
                <label>Yes</label>
              </div>
              <div className="radio-item">
                <input
                  type="radio"
                  name="mr_swap_dump"
                  value="No"
                  checked={swapDump === 'No'}
                  onChange={(e) => setSwapDump(e.target.value)}
                />
                <label>No</label>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>SWAPOUT REASON (OP to enter in MaskSwap Reason):</label>
            <div className="radio-group">
              {[
                '-MD/Facility/Sales Rep Swapped',
                '-RT Swapped',
                '-Swap Error',
                '-Discomfort',
              ].map((r) => (
                <div key={r} className="radio-item">
                  <input
                    type="radio"
                    name="mr_swap_reason"
                    value={r}
                    checked={swapReason === r}
                    onChange={(e) => setSwapReason(e.target.value)}
                  />
                  <label>{r.replace('-', '')}</label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {reqType === 'RESHIP' && (
        <div id="mr_reship_section" className="form-section">
          <h3>RESHIP- Machine/Humidifier was not delivered/lost in transit</h3>
          <div className="grid grid-2">
            <div className="form-group">
              <label>Machine Make (REQUIRED):</label>
              <input
                type="text"
                id="mr_reship_make"
                value={reshipMake}
                onChange={(e) => setReshipMake(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Machine Model (REQUIRED):</label>
              <input
                type="text"
                id="mr_reship_model"
                value={reshipModel}
                onChange={(e) => setReshipModel(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Machine Serial Number (REQUIRED):</label>
              <input
                type="text"
                id="mr_reship_serial"
                value={reshipSerial}
                onChange={(e) => setReshipSerial(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Original set-up date (REQUIRED):</label>
              <input
                type="date"
                id="mr_reship_setup"
                value={reshipSetup}
                onChange={(e) => setReshipSetup(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Pressure listed on RX (REQUIRED):</label>
              <input
                type="text"
                id="mr_reship_pres"
                value={reshipPres}
                onChange={(e) => setReshipPres(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>RX dated (REQUIRED):</label>
              <input
                type="date"
                id="mr_reship_rx"
                value={reshipRx}
                onChange={(e) => setReshipRx(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Diagnostic templates section */}
      <div className="form-section" style={{ background: '#2D4A2D', borderLeftColor: '#4CAF50' }}>
        <h3 className="text-green">
          Fill out template that applies to any issue the patient is experiencing:
        </h3>
        <div className="form-group">
          <select
            id="mr_template_type"
            value={templateType}
            onChange={(e) => setTemplateType(e.target.value)}
          >
            <option value="N/A">N/A</option>
            <option value="noise">Noise</option>
            <option value="no_air">No air blowing out from machine</option>
            <option value="loss_pres">Loss of pressure</option>
            <option value="hum_heat">Humidifier is not heating up</option>
            <option value="rain_out">Rain out not resolving</option>
            <option value="no_turn_on">Machine will not turn on</option>
            <option value="no_data">Not recording data</option>
            <option value="lost_reship">Lost/Stolen/Reship</option>
            <option value="lost_fire">Lost in Fire/Hurricane</option>
          </select>
        </div>

        {templateType === 'noise' && (
          <div id="tpl_noise" className="mr-template-group mt-20 space-y-3">
            <div className="form-group">
              <label>If the patient has AirSense 10/11, are they experiencing a winding noise?</label>
              <div className="radio-group">
                <div className="radio-item"><input type="radio" value="Yes" checked={noise1 === 'Yes'} onChange={(e) => setNoise1(e.target.value)} /><label>Yes</label></div>
                <div className="radio-item"><input type="radio" value="No" checked={noise1 === 'No'} onChange={(e) => setNoise1(e.target.value)} /><label>No</label></div>
              </div>
            </div>
            <div className="form-group">
              <label>What type of noise is the patient hearing?</label>
              <input type="text" value={noise2} onChange={(e) => setNoise2(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Did patient disconnect mask and tubing and reconnect to the machine?</label>
              <div className="radio-group">
                <div className="radio-item"><input type="radio" value="Yes" checked={noise3 === 'Yes'} onChange={(e) => setNoise3(e.target.value)} /><label>Yes</label></div>
                <div className="radio-item"><input type="radio" value="No" checked={noise3 === 'No'} onChange={(e) => setNoise3(e.target.value)} /><label>No</label></div>
              </div>
            </div>
            <div className="form-group">
              <label>Did patient check seals on machine and humidifier and make sure they are in place?</label>
              <div className="radio-group">
                <div className="radio-item"><input type="radio" value="Yes" checked={noise4 === 'Yes'} onChange={(e) => setNoise4(e.target.value)} /><label>Yes</label></div>
                <div className="radio-item"><input type="radio" value="No" checked={noise4 === 'No'} onChange={(e) => setNoise4(e.target.value)} /><label>No</label></div>
              </div>
            </div>
            <div className="form-group">
              <label>Did the patient remove the humidifier on Dreamstation and re attach?</label>
              <div className="radio-group">
                <div className="radio-item"><input type="radio" value="Yes" checked={noise5 === 'Yes'} onChange={(e) => setNoise5(e.target.value)} /><label>Yes</label></div>
                <div className="radio-item"><input type="radio" value="No" checked={noise5 === 'No'} onChange={(e) => setNoise5(e.target.value)} /><label>No</label></div>
              </div>
            </div>
            <div className="form-group">
              <label>Did the patient take the water chamber off the ResMed and check the seal?</label>
              <div className="radio-group">
                <div className="radio-item"><input type="radio" value="Yes" checked={noise6 === 'Yes'} onChange={(e) => setNoise6(e.target.value)} /><label>Yes</label></div>
                <div className="radio-item"><input type="radio" value="No" checked={noise6 === 'No'} onChange={(e) => setNoise6(e.target.value)} /><label>No</label></div>
              </div>
            </div>
            <div className="form-group">
              <label>Did the patient make sure that the filters are clean?</label>
              <div className="radio-group">
                <div className="radio-item"><input type="radio" value="Yes" checked={noise7 === 'Yes'} onChange={(e) => setNoise7(e.target.value)} /><label>Yes</label></div>
                <div className="radio-item"><input type="radio" value="No" checked={noise7 === 'No'} onChange={(e) => setNoise7(e.target.value)} /><label>No</label></div>
              </div>
            </div>
            <div className="form-group">
              <label>Did you check for any loose components?</label>
              <div className="radio-group">
                <div className="radio-item"><input type="radio" value="Yes" checked={noise8 === 'Yes'} onChange={(e) => setNoise8(e.target.value)} /><label>Yes</label></div>
                <div className="radio-item"><input type="radio" value="No" checked={noise8 === 'No'} onChange={(e) => setNoise8(e.target.value)} /><label>No</label></div>
              </div>
            </div>
          </div>
        )}

        {templateType === 'no_air' && (
          <div id="tpl_no_air" className="mr-template-group mt-20 space-y-3">
            <div className="form-group">
              <label>Did you check to make sure the tube is connected properly with no holes in It?</label>
              <div className="radio-group">
                <div className="radio-item"><input type="radio" value="Yes" checked={noAir1 === 'Yes'} onChange={(e) => setNoAir1(e.target.value)} /><label>Yes</label></div>
                <div className="radio-item"><input type="radio" value="No" checked={noAir1 === 'No'} onChange={(e) => setNoAir1(e.target.value)} /><label>No</label></div>
              </div>
            </div>
            <div className="form-group">
              <label>Did you check the filters to make sure clean to avoid blockages?</label>
              <div className="radio-group">
                <div className="radio-item"><input type="radio" value="Yes" checked={noAir2 === 'Yes'} onChange={(e) => setNoAir2(e.target.value)} /><label>Yes</label></div>
                <div className="radio-item"><input type="radio" value="No" checked={noAir2 === 'No'} onChange={(e) => setNoAir2(e.target.value)} /><label>No</label></div>
              </div>
            </div>
            <div className="form-group">
              <label>Did you check multiple power outlets?</label>
              <div className="radio-group">
                <div className="radio-item"><input type="radio" value="Yes" checked={noAir3 === 'Yes'} onChange={(e) => setNoAir3(e.target.value)} /><label>Yes</label></div>
                <div className="radio-item"><input type="radio" value="No" checked={noAir3 === 'No'} onChange={(e) => setNoAir3(e.target.value)} /><label>No</label></div>
              </div>
            </div>
            <div className="form-group">
              <label>Did you make sure not plugged into anything but a wall outlet?</label>
              <div className="radio-group">
                <div className="radio-item"><input type="radio" value="Yes" checked={noAir4 === 'Yes'} onChange={(e) => setNoAir4(e.target.value)} /><label>Yes</label></div>
                <div className="radio-item"><input type="radio" value="No" checked={noAir4 === 'No'} onChange={(e) => setNoAir4(e.target.value)} /><label>No</label></div>
              </div>
            </div>
            <div className="form-group">
              <label>Did we already send a new power cord as that may be the issue?</label>
              <div className="radio-group">
                <div className="radio-item"><input type="radio" value="Yes" checked={noAir5 === 'Yes'} onChange={(e) => setNoAir5(e.target.value)} /><label>Yes</label></div>
                <div className="radio-item"><input type="radio" value="No" checked={noAir5 === 'No'} onChange={(e) => setNoAir5(e.target.value)} /><label>No</label></div>
              </div>
            </div>
            <div className="form-group">
              <label>Did you check Airview to see if Smart Start if on?</label>
              <div className="radio-group">
                <div className="radio-item"><input type="radio" value="Yes" checked={noAir6 === 'Yes'} onChange={(e) => setNoAir6(e.target.value)} /><label>Yes</label></div>
                <div className="radio-item"><input type="radio" value="No" checked={noAir6 === 'No'} onChange={(e) => setNoAir6(e.target.value)} /><label>No</label></div>
              </div>
            </div>
            <div className="form-group">
              <label>Did the pt drop the machine?</label>
              <div className="radio-group">
                <div className="radio-item"><input type="radio" value="Yes" checked={noAir7 === 'Yes'} onChange={(e) => setNoAir7(e.target.value)} /><label>Yes</label></div>
                <div className="radio-item"><input type="radio" value="No" checked={noAir7 === 'No'} onChange={(e) => setNoAir7(e.target.value)} /><label>No</label></div>
              </div>
            </div>
          </div>
        )}

        {templateType === 'loss_pres' && (
          <div id="tpl_loss_pres" className="mr-template-group mt-20 space-y-3">
            <div className="form-group">
              <label>Did the patient take humidifier out and reattach seal? *Cannot remove seals on ResMed machines.*</label>
              <div className="radio-group">
                <div className="radio-item"><input type="radio" value="Yes" checked={lossPres1 === 'Yes'} onChange={(e) => setLossPres1(e.target.value)} /><label>Yes</label></div>
                <div className="radio-item"><input type="radio" value="No" checked={lossPres1 === 'No'} onChange={(e) => setLossPres1(e.target.value)} /><label>No</label></div>
              </div>
            </div>
            <div className="form-group">
              <label>When is the last time the patient changed the filter?</label>
              <input type="text" value={lossPres2} onChange={(e) => setLossPres2(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Did patient remove the tubing?</label>
              <div className="radio-group">
                <div className="radio-item"><input type="radio" value="Yes" checked={lossPres3 === 'Yes'} onChange={(e) => setLossPres3(e.target.value)} /><label>Yes</label></div>
                <div className="radio-item"><input type="radio" value="No" checked={lossPres3 === 'No'} onChange={(e) => setLossPres3(e.target.value)} /><label>No</label></div>
              </div>
            </div>
            <div className="form-group">
              <label>Is the machine blowing normally without the tubing attached?</label>
              <div className="radio-group">
                <div className="radio-item"><input type="radio" value="Yes" checked={lossPres4 === 'Yes'} onChange={(e) => setLossPres4(e.target.value)} /><label>Yes</label></div>
                <div className="radio-item"><input type="radio" value="No" checked={lossPres4 === 'No'} onChange={(e) => setLossPres4(e.target.value)} /><label>No</label></div>
              </div>
            </div>
            <div className="form-group">
              <label>If yes; attach tube to the machine, is the machine blowing normally with tubing attached?</label>
              <div className="radio-group">
                <div className="radio-item"><input type="radio" value="Yes" checked={lossPres5 === 'Yes'} onChange={(e) => setLossPres5(e.target.value)} /><label>Yes</label></div>
                <div className="radio-item"><input type="radio" value="No" checked={lossPres5 === 'No'} onChange={(e) => setLossPres5(e.target.value)} /><label>No</label></div>
              </div>
            </div>
            <div className="form-group">
              <label>If yes; attach the mask, is the machine blowing normally with tubing and mask attached?</label>
              <div className="radio-group">
                <div className="radio-item"><input type="radio" value="Yes" checked={lossPres6 === 'Yes'} onChange={(e) => setLossPres6(e.target.value)} /><label>Yes</label></div>
                <div className="radio-item"><input type="radio" value="No" checked={lossPres6 === 'No'} onChange={(e) => setLossPres6(e.target.value)} /><label>No</label></div>
              </div>
            </div>
          </div>
        )}

        {templateType === 'hum_heat' && (
          <div id="tpl_hum_heat" className="mr-template-group mt-20 space-y-3">
            <div className="mb-10 text-whiteold">Have pt run the machine for a minute or two then turn off.</div>
            <div className="form-group">
              <label>Does the patient feel heat coming from the plate?</label>
              <div className="radio-group">
                <div className="radio-item"><input type="radio" value="Yes" checked={humHeat1 === 'Yes'} onChange={(e) => setHumHeat1(e.target.value)} /><label>Yes</label></div>
                <div className="radio-item"><input type="radio" value="No" checked={humHeat1 === 'No'} onChange={(e) => setHumHeat1(e.target.value)} /><label>No</label></div>
              </div>
            </div>
            <div className="form-group">
              <label>Is the humidifier on fixed mode?</label>
              <div className="radio-group">
                <div className="radio-item"><input type="radio" value="Yes" checked={humHeat2 === 'Yes'} onChange={(e) => setHumHeat2(e.target.value)} /><label>Yes</label></div>
                <div className="radio-item"><input type="radio" value="No" checked={humHeat2 === 'No'} onChange={(e) => setHumHeat2(e.target.value)} /><label>No</label></div>
              </div>
            </div>
          </div>
        )}

        {templateType === 'rain_out' && (
          <div id="tpl_rain_out" className="mr-template-group mt-20 space-y-3">
            <div className="form-group">
              <label>Does the pt have a heated tube?</label>
              <div className="radio-group">
                <div className="radio-item"><input type="radio" value="Yes" checked={rainOut1 === 'Yes'} onChange={(e) => setRainOut1(e.target.value)} /><label>Yes</label></div>
                <div className="radio-item"><input type="radio" value="No" checked={rainOut1 === 'No'} onChange={(e) => setRainOut1(e.target.value)} /><label>No</label></div>
              </div>
              <div className="text-small text-whiteold text-orange">(If not send heated tube)</div>
            </div>
            <div className="form-group">
              <label>Is the heated tube on?</label>
              <div className="radio-group">
                <div className="radio-item"><input type="radio" value="Yes" checked={rainOut2 === 'Yes'} onChange={(e) => setRainOut2(e.target.value)} /><label>Yes</label></div>
                <div className="radio-item"><input type="radio" value="No" checked={rainOut2 === 'No'} onChange={(e) => setRainOut2(e.target.value)} /><label>No</label></div>
              </div>
            </div>
            <div className="form-group">
              <label>Have several attempts been made to adjust both heated tube and humidity?</label>
              <div className="radio-group">
                <div className="radio-item"><input type="radio" value="Yes" checked={rainOut3 === 'Yes'} onChange={(e) => setRainOut3(e.target.value)} /><label>Yes</label></div>
                <div className="radio-item"><input type="radio" value="No" checked={rainOut3 === 'No'} onChange={(e) => setRainOut3(e.target.value)} /><label>No</label></div>
              </div>
            </div>
          </div>
        )}

        {templateType === 'no_turn_on' && (
          <div id="tpl_no_turn_on" className="mr-template-group mt-20 space-y-3">
            <div className="form-group">
              <label>Did the patient try an alternative power source?</label>
              <div className="radio-group">
                <div className="radio-item"><input type="radio" value="Yes" checked={noTurnOn1 === 'Yes'} onChange={(e) => setNoTurnOn1(e.target.value)} /><label>Yes</label></div>
                <div className="radio-item"><input type="radio" value="No" checked={noTurnOn1 === 'No'} onChange={(e) => setNoTurnOn1(e.target.value)} /><label>No</label></div>
              </div>
            </div>
            <div className="form-group">
              <label>Did the patient unplug the power source from the machine and wall and reconnect it?</label>
              <div className="radio-group">
                <div className="radio-item"><input type="radio" value="Yes" checked={noTurnOn2 === 'Yes'} onChange={(e) => setNoTurnOn2(e.target.value)} /><label>Yes</label></div>
                <div className="radio-item"><input type="radio" value="No" checked={noTurnOn2 === 'No'} onChange={(e) => setNoTurnOn2(e.target.value)} /><label>No</label></div>
              </div>
            </div>
            <div className="form-group">
              <label>Did the patient disconnect the power adapters from each other and plug them back in?</label>
              <div className="radio-group">
                <div className="radio-item"><input type="radio" value="Yes" checked={noTurnOn3 === 'Yes'} onChange={(e) => setNoTurnOn3(e.target.value)} /><label>Yes</label></div>
                <div className="radio-item"><input type="radio" value="No" checked={noTurnOn3 === 'No'} onChange={(e) => setNoTurnOn3(e.target.value)} /><label>No</label></div>
              </div>
            </div>
            <div className="form-group">
              <label>Is the green light on, on the power supply?</label>
              <div className="radio-group">
                <div className="radio-item"><input type="radio" value="Yes" checked={noTurnOn4 === 'Yes'} onChange={(e) => setNoTurnOn4(e.target.value)} /><label>Yes</label></div>
                <div className="radio-item"><input type="radio" value="No" checked={noTurnOn4 === 'No'} onChange={(e) => setNoTurnOn4(e.target.value)} /><label>No</label></div>
              </div>
              <div className="text-small text-whiteold text-orange">If no replace the power cord/supply first.</div>
            </div>
            <div className="form-group">
              <label>Did you check AirView to see if Smart Start if on?</label>
              <div className="radio-group">
                <div className="radio-item"><input type="radio" value="Yes" checked={noTurnOn5 === 'Yes'} onChange={(e) => setNoTurnOn5(e.target.value)} /><label>Yes</label></div>
                <div className="radio-item"><input type="radio" value="No" checked={noTurnOn5 === 'No'} onChange={(e) => setNoTurnOn5(e.target.value)} /><label>No</label></div>
              </div>
            </div>
          </div>
        )}

        {templateType === 'no_data' && (
          <div id="tpl_no_data" className="mr-template-group mt-20 space-y-3">
            <div className="mb-20 text-whiteold text-red">(Not applicable for loaner request)</div>
            <h4 className="text-whitelue">ResMed:</h4>
            <div className="mb-10 text-sm">Check signal strength (should be at least 4 bars:)</div>
            <div className="form-group">
              <label>How many bars are showing?</label>
              <input type="text" value={noData1} onChange={(e) => setNoData1(e.target.value)} />
            </div>
            <div className="form-group">
              <label>What is the serial number from the patients machine? (Get this from the patient we may have it incorrect in our system.)</label>
              <input type="text" value={noData2} onChange={(e) => setNoData2(e.target.value)} />
            </div>

            <h4 className="text-whitelue mt-5">React:</h4>
            <div className="mb-10 text-sm">Check machine has a modem:</div>
            <div className="form-group">
              <label>Was power cycle done?</label>
              <div className="radio-group">
                <div className="radio-item"><input type="radio" value="Yes" checked={noData3 === 'Yes'} onChange={(e) => setNoData3(e.target.value)} /><label>Yes</label></div>
                <div className="radio-item"><input type="radio" value="No" checked={noData3 === 'No'} onChange={(e) => setNoData3(e.target.value)} /><label>No</label></div>
              </div>
            </div>
            <div className="form-group">
              <label>How many bars are showing?</label>
              <input type="text" value={noData4} onChange={(e) => setNoData4(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Scan QR+ code, does it transmit data?</label>
              <div className="radio-group">
                <div className="radio-item"><input type="radio" value="Yes" checked={noData5 === 'Yes'} onChange={(e) => setNoData5(e.target.value)} /><label>Yes</label></div>
                <div className="radio-item"><input type="radio" value="No" checked={noData5 === 'No'} onChange={(e) => setNoData5(e.target.value)} /><label>No</label></div>
              </div>
            </div>
            <div className="form-group">
              <label>Get iCodes, does it pull data?</label>
              <div className="radio-group">
                <div className="radio-item"><input type="radio" value="Yes" checked={noData6 === 'Yes'} onChange={(e) => setNoData6(e.target.value)} /><label>Yes</label></div>
                <div className="radio-item"><input type="radio" value="No" checked={noData6 === 'No'} onChange={(e) => setNoData6(e.target.value)} /><label>No</label></div>
              </div>
            </div>
            <div className="form-group">
              <label>Does the machine have data on it?</label>
              <div className="radio-group">
                <div className="radio-item"><input type="radio" value="Yes" checked={noData7 === 'Yes'} onChange={(e) => setNoData7(e.target.value)} /><label>Yes</label></div>
                <div className="radio-item"><input type="radio" value="No" checked={noData7 === 'No'} onChange={(e) => setNoData7(e.target.value)} /><label>No</label></div>
              </div>
            </div>
          </div>
        )}

        {templateType === 'lost_reship' && (
          <div id="tpl_lost_reship" className="mr-template-group mt-20 space-y-3">
            <div className="form-group">
              <label>Can you please confirm your address?</label>
              <input type="text" value={lostReship1} onChange={(e) => setLostReship1(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Is it a common occurrence to have missing packages?</label>
              <div className="radio-group">
                <div className="radio-item"><input type="radio" value="Yes" checked={lostReship2 === 'Yes'} onChange={(e) => setLostReship2(e.target.value)} /><label>Yes</label></div>
                <div className="radio-item"><input type="radio" value="No" checked={lostReship2 === 'No'} onChange={(e) => setLostReship2(e.target.value)} /><label>No</label></div>
              </div>
            </div>
            <div className="form-group">
              <label>What does tracking number indicate?</label>
              <input type="text" value={lostReship3} onChange={(e) => setLostReship3(e.target.value)} />
            </div>
          </div>
        )}

        {templateType === 'lost_fire' && (
          <div id="tpl_lost_fire" className="mr-template-group mt-20 space-y-3">
            <div className="form-group">
              <label>Confirm delivery address:</label>
              <input type="text" value={lostFire1} onChange={(e) => setLostFire1(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Was the machine lost due to fire or hurricane?:</label>
              <div className="radio-group">
                <div className="radio-item"><input type="radio" value="Fire" checked={lostFire2 === 'Fire'} onChange={(e) => setLostFire2(e.target.value)} /><label>Fire</label></div>
                <div className="radio-item"><input type="radio" value="Hurricane" checked={lostFire2 === 'Hurricane'} onChange={(e) => setLostFire2(e.target.value)} /><label>Hurricane</label></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="btn-group flex items-center flex-wrap gap-2">
        <button type="button" className="btn btn-primary" onClick={handleCopyTitle}>
          Copy Title
        </button>
        <button type="button" className="btn btn-primary" onClick={handleCopyBody}>
          Copy Body
        </button>
        <button type="button" className="btn btn-danger" onClick={handleClear}>
          Clear
        </button>
      </div>

      <GeneratedNotePreview generatedText={generateBody()} showToast={showToast} />
    </div>
  );
};
