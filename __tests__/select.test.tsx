/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { getNodeText, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MultiSelect } from '../client/ui/MultiSelect.jsx';
import { Select } from '../client/ui/Select.jsx';
import { popoverRootId } from '../client/lib/utils.jsx';
import { ISelectOption, ISelectedOption } from '../lib/types.js';

describe('Select Components', () => {
  const options = [
    { label: '', value: '' },
    { label: 'Banana', value: 'Banana' },
    { label: 'Ananas', value: 'Ananas' },
    { label: 'Grains', value: 'Grains' },
    { label: 'Butter', value: 'Butter' },
  ];

  const renderSelect = (onSelect, selectedOption: ISelectedOption = null) => (
    <div>
      <Select options={options} selectedOption={selectedOption} onSelect={onSelect} />
      <div id={popoverRootId}></div>
    </div>
  );

  const renderMultiSelect = (onSelect, selectedOptions: ISelectOption[] = []) => (
    <div>
      <MultiSelect options={options} selectedOptions={selectedOptions} onSelect={onSelect} />
      <div id={popoverRootId}></div>
    </div>
  );

  it('Select should work', async () => {
    const onSelect = jest.fn();
    let popupEl, optionEl;
    const user = userEvent.setup();
    const { rerender } = render(renderSelect(onSelect));

    const inputEl = screen.getByTestId('input');
    popupEl = screen.queryByTestId('popup');
    expect(inputEl).toHaveValue('');
    expect(popupEl).not.toBeInTheDocument();

    await user.click(inputEl);
    popupEl = screen.queryByTestId('popup');
    expect(popupEl).toBeInTheDocument();
    expect(screen.queryAllByTestId('option')).toHaveLength(5);

    await user.type(inputEl, 'an');
    expect(screen.queryAllByTestId('option')).toHaveLength(2);

    await user.type(inputEl, 'not exists');
    expect(screen.queryAllByTestId('option')).toHaveLength(0);
    expect(screen.getByTestId('not-found')).toBeInTheDocument();

    const newSelectedOption = options[3];
    await user.clear(inputEl);
    optionEl = await screen.findByText(newSelectedOption.label);
    await user.click(optionEl);
    rerender(renderSelect(onSelect, newSelectedOption));
    const calledArg = onSelect.mock.calls[0][0];
    popupEl = screen.queryByTestId('popup');
    expect(calledArg).toEqual(newSelectedOption);
    expect(inputEl).toHaveValue(newSelectedOption.label);
    expect(popupEl).not.toBeInTheDocument();

    await user.click(inputEl);
    optionEl = screen.getByText(newSelectedOption.label);
    expect(screen.queryAllByTestId('option')).toHaveLength(5);
    expect(optionEl).toHaveClass('option_selected', 'option_keyboardChoosen');
  });

  it('Select should work with keyboard buttons', async () => {
    const onSelect = jest.fn();
    let popupEl;
    const user = userEvent.setup();
    render(renderSelect(onSelect));

    const inputEl = screen.getByTestId('input');
    await user.click(inputEl);
    await user.keyboard('[Escape]');
    popupEl = screen.queryByTestId('popup');
    expect(popupEl).not.toBeInTheDocument();

    await user.click(inputEl);
    await user.keyboard('[ArrowDown][ArrowDown]');
    const optionEl = screen.queryAllByTestId('option')[1];
    expect(optionEl).toHaveClass('option_keyboardChoosen');

    await user.keyboard('[Enter]');
    popupEl = screen.queryByTestId('popup');
    const calledArg = onSelect.mock.calls[0][0];
    expect(popupEl).not.toBeInTheDocument();
    expect(calledArg).toEqual(options[1]);
  });

  it('MultiSelect should work', async () => {
    const onSelect = jest.fn();
    let popupEl, selectedOptions;
    const user = userEvent.setup();
    const { rerender } = render(renderMultiSelect(onSelect));

    const inputWrapperEl = screen.getByTestId('inputWrapper');
    const inputEl = screen.getByTestId('input');
    popupEl = screen.queryByTestId('popup');
    expect(inputEl).toHaveValue('');
    expect(popupEl).not.toBeInTheDocument();

    await user.click(inputWrapperEl);
    popupEl = screen.queryByTestId('popup');
    expect(screen.queryAllByTestId('option')).toHaveLength(5);

    await user.type(inputEl, 'an');
    expect(screen.queryAllByTestId('option')).toHaveLength(2);

    const bananaOption = options[1];
    await user.click(screen.getByText(bananaOption.label));
    rerender(renderMultiSelect(onSelect, [bananaOption]));
    popupEl = screen.queryByTestId('popup');
    selectedOptions = screen.getAllByTestId('selectedOption');
    const calledArg = onSelect.mock.calls[0][0];
    expect(calledArg).toEqual([bananaOption]);
    expect(inputEl).toHaveValue('');
    expect(popupEl).not.toBeInTheDocument();
    expect(selectedOptions).toHaveLength(1);
    expect(within(selectedOptions[0]).getByText(bananaOption.label)).toBeInTheDocument();

    await user.click(inputWrapperEl);
    const availableOptions = screen.queryAllByTestId('option').map(el => getNodeText(el));
    const expectedAvailableOptions = options
      .map(el => el.label)
      .filter(el => el !== bananaOption.label);
    expect(availableOptions).toMatchObject(expectedAvailableOptions); // popup - no banana

    const grainsOption = options[3];
    await user.click(screen.getByText(grainsOption.label));
    rerender(renderMultiSelect(onSelect, [bananaOption, grainsOption]));
    const selectedOptionsLabels = screen.getAllByTestId('selectedOptionLabel');
    expect(selectedOptionsLabels).toHaveLength(2);
    expect(selectedOptionsLabels.map(el => getNodeText(el))).toMatchObject([
      bananaOption.label,
      grainsOption.label,
    ]);

    selectedOptions = screen.getAllByTestId('selectedOption');
    onSelect.mockClear();
    const removeBananaBtn = within(selectedOptions[0]).getByTestId('removeBtn');
    await user.click(removeBananaBtn);
    expect(onSelect.mock.calls[0][0]).toEqual([grainsOption]);
  });
});
