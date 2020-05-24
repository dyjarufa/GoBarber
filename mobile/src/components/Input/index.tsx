import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useState,
} from 'react'; // hook useImperativeHandle => serve para passar uma função interna de um componente filho para um componente pai. É o caminho inverso do habitual
import { TextInputProps } from 'react-native';
import { useField } from '@unform/core'; // vou registrar os campos do formulário

import { Container, TextInput, Icon } from './styles';

interface InputProps extends TextInputProps {
  name: string;
  icon: string;
}

interface InputValueReference {
  value: string;
}

interface InputRef {
  focus(): void;
}

const Input: React.RefForwardingComponent<InputRef, InputProps> = (
  { name, icon, ...rest },
  ref, // agora minha ref entende que quero a informação contida na interface InputRef (focus)
) => {
  const inputElemteRef = useRef<any>(null);

  const { registerField, defaultValue = '', fieldName, error } = useField(name);

  const inputValueRef = useRef<InputValueReference>({ value: defaultValue });

  const [isFocused, setIsFocused] = useState(false);
  const [isFilled, setIsFilled] = useState(false);

  const handleInputFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleInoutBlur = useCallback(() => {
    setIsFocused(false);

    setIsFilled(!!inputValueRef.current.value); // se tiver algum valor dentro dessa var é true senão false
  }, []);

  useImperativeHandle(ref, () => ({
    focus() {
      inputElemteRef.current.focus();
    },
  }));

  // Assim que esse componente aparecer na tela quero registra-lo no unform
  useEffect(() => {
    registerField<string>({
      name: fieldName,
      ref: inputValueRef.current,
      path: 'value',

      setValue(ref: any, value) {
        inputValueRef.current.value = value;
        inputElemteRef.current.setNataiveProps({ text: value });
      },
      clearValue() {
        inputValueRef.current.value = '';
        inputElemteRef.current.clear();
      },
    });
  }, [fieldName, registerField]);

  return (
    <Container isFocused={isFocused} isErrored={!!error}>
      <Icon
        name={icon}
        size={20}
        color={isFocused || isFilled ? '#ff9000' : '#666360'}
      />

      <TextInput
        ref={inputElemteRef}
        keyboardAppearance="dark"
        placeholderTextColor="#666360"
        defaultValue={defaultValue}
        onFocus={handleInputFocus}
        onBlur={handleInoutBlur}
        onChangeText={value => {
          inputValueRef.current.value = value;
        }}
        {...rest}
      />
    </Container>
  );
};

export default forwardRef(Input);
