import React, { useEffect, useState} from 'react';
import {Button, FormControl} from 'react-bootstrap';
import 'pages/holder/Holder.scss'
import ApiService from 'utils/apiService';
import {GetSavedCredentialsOutput, UnsignedW3cCredential, W3cCredential} from 'utils/apis';

interface State {
  currentUnsignedVC: UnsignedW3cCredential | null,
  currentSignedVC: W3cCredential | null,
  isCurrentVCVerified: boolean,
  storedVCs: GetSavedCredentialsOutput,
  isLoadingStoredVCs: boolean
}

/**
 * Stateful component responsible for rendering the showcase of this app.
 * The basic parts of SSI cycle are covered with this component.
 * */
const Holder = () => {
  const [state, setState] = useState<State>({
    currentUnsignedVC: null,
    currentSignedVC: null,
    isCurrentVCVerified: false,
    storedVCs: [],
    isLoadingStoredVCs: true
  })
  const [inputVC, setinputVC] = useState('')

  /**
   * Get stored VCs from user cloud wallet on component mount.
   * */
  useEffect(() => {
    const getSavedVCs = async () => {
      try {
        const arrayOfStoredVCs = await ApiService.getSavedVCs();

        setState({
          ...state,
          storedVCs: [...arrayOfStoredVCs],
          isLoadingStoredVCs: false
        })
      } catch (error) {
        ApiService.alertWithBrowserConsole(error.message)

        setState({
          ...state,
          isLoadingStoredVCs: false
        })
      }
    }

    getSavedVCs();
  }, []);

  /**
   * Function for storing a signed VC into the user cloud wallet.
   * */
  const storeSignedVC = async () => {
    try {
      if( isJson(inputVC) ) {
        const vc = JSON.parse(inputVC)
        await ApiService.storeSignedVCs({
          data: [vc]
        });

        setState({
          ...state,
          storedVCs: [...state.storedVCs, vc]
        })

        alert('Signed VC successfully stored in your cloud wallet.');
        setinputVC('')
      }
      else {
        alert('No signed VC found. Please sign a VC and try again.');
      }
    } catch (error) {
      ApiService.alertWithBrowserConsole(error.message);
    }
  }

  /**
   * Function for deleting a stored VC.
   * */
  const deleteStoredVC = async (index: number) => {
    try {
      await ApiService.deleteStoredVC(state.storedVCs[index].id);

      setState({
        ...state,
        storedVCs: state.storedVCs.filter((value, idx) => idx !== index)
      })

      alert('Verified VC successfully deleted from your cloud wallet.');
    } catch (error) {
      ApiService.alertWithBrowserConsole(error.message);
    }
  }

  const onVCValueChange = (value: string) => {
    setinputVC(value)    
  }

  const isJson = (str: string) => {
      try {
          JSON.parse(str);
      } catch (e) {
          return false;
      }
      return true;
  }

  return (
    <div className='tutorial'>
      {/* <div className='tutorial__column tutorial__column--holder'>
        <h3 className='tutorial__column-title'>Holder</h3>
        <div className='tutorial__column-steps'>
          <div className='tutorial__step'> */}
            <span className='tutorial__step-text'>
              {/* <strong>Step 3:</strong>  */}
              Store signed VC
            </span>
          {/* </div> */}

          {/* <h5 className='font-weight-bold'>Current VC:{(!state.currentUnsignedVC && !state.currentSignedVC) && (' None')}</h5> */}
          <FormControl
              as="textarea"
              rows={15}
              placeholder="Enter the VC"
              aria-label="Verifiable Credential"
              aria-describedby="basic-addon1"
              value={inputVC}
              onChange={e => onVCValueChange(e.target.value)}
              style={{margin: '20px 0'}}
            />
            <Button onClick={storeSignedVC}>Store signed VC</Button>
          {(state.currentUnsignedVC || state.currentSignedVC) && (
            <>
              <div>
                <span className='tutorial__status'>
                  <input
                    className='tutorial__status-input'
                    type='checkbox'
                    readOnly
                    checked={!!state.currentSignedVC}
                    id='vc-signed-checkbox'
                  />
                  <label htmlFor='vc-signed-checkbox'>Signed</label>
                </span>
                <span className='tutorial__status'>
                  <input
                    className='tutorial__status-input'
                    type='checkbox'
                    readOnly
                    checked={state.isCurrentVCVerified}
                    id='vc-verified-checkbox'
                  />
                  <label htmlFor='vc-verified-checkbox'>Verified</label>
                </span>
              </div>
              <textarea
                className='tutorial__textarea'
                readOnly
                name='credentials'
                value={JSON.stringify(state.currentSignedVC || state.currentUnsignedVC, undefined, '\t')}
              />
            </>
          )}

          <div className='tutorial__verified-vcs'>
            <h5 className='font-weight-bold'>Stored VCs:</h5>
            {state.isLoadingStoredVCs && <p>Loading...</p>}
            {!state.storedVCs.length && ('You didn\'t store any signed VCs')}
            {state.storedVCs.map((storedVC, index) => {
              return (
                <div key={index} className='tutorial__textarea-block'>
                  <textarea
                    className='tutorial__textarea tutorial__textarea--small'
                    readOnly
                    name='stored-credentials'
                    value={JSON.stringify(storedVC, undefined, '\t')}
                  />
                  <Button className='tutorial__delete-button' onClick={() => deleteStoredVC(index)}>Delete this VC</Button>
                </div>
              )
            })}
          </div>
        {/* </div>
      </div> */}
    </div>
  )
}

export default Holder
