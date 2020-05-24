import React, { useCallback, useRef } from 'react';
import {
  View,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import * as Yup from 'yup';
import { Form } from '@unform/mobile';
import { FormHandles } from '@unform/core';
import getValidationErrors from '../../utils/getValidationErrors';

import Input from '../../components/Input';
import Button from '../../components/Button';

import { useAuth } from '../../hooks/auth';

import {
  Container,
  Title,
  ForgotPassword,
  ForgotPasswordText,
  CreateAccountButton,
  CreateAccountText,
} from './styles';

import logoImg from '../../assets/logo.png';

interface SignInFormData {
  email: string;
  password: string;
}

const SignIn: React.FC = () => {
  const navigation = useNavigation();

  const formRef = useRef<FormHandles>(null); // FormHandles métodos que temos disponíveis quando queremos manipular formulários de maneira direta
  const passwordInputRef = useRef<TextInput>(null); // estratégia - tipo minha ref como textInpit para ter acesso ao método focus

  const { signIn } = useAuth();

  const handleSignIn = useCallback(
    async (data: SignInFormData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          email: Yup.string()
            .required('E-mail é obrigatório')
            .email('Digite um e-mail válido'),
          password: Yup.string().required('Senha é obrigatória'),
        });

        await schema.validate(data, { abortEarly: false });

        await signIn({
          email: data.email,
          password: data.password,
        });

        // history.push('/dashboard');
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);
          return;
        }

        Alert.alert(
          'Erro na autenticação',
          'Ocorreu um error ao fazer login, cheque as credenciais.',
        );
      }
    },
    [signIn],
  );

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled
      >
        <ScrollView
          contentContainerStyle={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <Container>
            <Image source={logoImg} />

            <View>
              <Title>Faça seu Logon</Title>
            </View>

            <Form ref={formRef} onSubmit={handleSignIn}>
              <Input
                autoCorrect={false} // desabilita auto correção
                autoCapitalize="none" // não tranforma em maiúscula a primeira letra
                keyboardType="email-address" // habiltado o @ no teclado, pois identifca que é um input de email
                name="email"
                icon="mail"
                placeholder="E-mail"
                returnKeyType="next" // pula para outro input
                onSubmitEditing={() => {
                  // preciso realizar o foco no input de baixo, para isso preciso dispparar o focus do input de senha(caminh contrário) - Irei usar as Ref para executar uma ação direto de um elemento
                  passwordInputRef.current?.focus();
                }}
              />

              <Input
                // A REF É A UNICA PROPRIEDADE QUE NÃO CONSIGO ACESSAR DE FORMA COMUM DENTRO DO ELEMENTO(nesse caso lá dentro do Input)
                ref={passwordInputRef} // passwordInputRef
                secureTextEntry // oculta os caractes no input da senha
                name="password"
                icon="lock"
                placeholder="Senha"
                returnKeyType="send" // o formuário pode ser enviar no teclado pelo teclado ( dependendo do OS pode aparece a tecla send)
                onSubmitEditing={() => {
                  formRef.current?.submitForm(); // em conjunto com o returnKeyType, essa propriedade realiza o submit do formulário
                }}
              />

              <Button
                onPress={
                  () => formRef.current?.submitForm() // Aqui manipulo de forma direta o submit do formulário ao clicar no botão
                }
              >
                Entrar
              </Button>
            </Form>

            <ForgotPassword onPress={() => {}}>
              <ForgotPasswordText> Esqueci minha senha</ForgotPasswordText>
            </ForgotPassword>
          </Container>
        </ScrollView>

        <CreateAccountButton onPress={() => navigation.navigate('SignUp')}>
          <Icon name="log-in" size={20} color="#ff9000" />
          <CreateAccountText> Criar uma conta</CreateAccountText>
        </CreateAccountButton>
      </KeyboardAvoidingView>
    </>
  );
};

export default SignIn;
